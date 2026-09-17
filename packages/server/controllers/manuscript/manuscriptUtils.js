const Handlebars = require('handlebars')
const { set, get } = require('lodash')
const { logger } = require('@coko/server')

const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')
const { ensureJsonIsParsed } = require('../../utils/objectUtils')
const { formatSearchQueryForPostgres } = require('../../utils/searchUtils')

const { getPublishableTextFromValue } = require('../../utils/fieldFormatUtils')

const {
  getStartOfDay,
  getEndOfDay,
  compactStringToDate,
  dateToIso8601,
} = require('../../utils/dateUtils')

const URI_SEARCH_PARAM = 'search'

/** Wraps a SQL text expression to strip HTML tags, so rich-text field values (e.g. an
 * AbstractEditor field, or the article body) read as plain text in a headline snippet. Postgres's
 * text search parser already treats tags as opaque "tag" tokens for matching purposes (so e.g.
 * an attribute like `class="paragraph"` was never matchable), but `ts_headline` still reproduces
 * the original markup verbatim around any matched words, so this only affects display. */
const stripHtmlTags = expression =>
  `regexp_replace(${expression}, '<[^>]+>', ' ', 'g')`

/** Builds the list of field groups a search snippet can be labeled with: one per field defined on
 * the submission form (so a snippet is labeled with the same field title an editor sees on the
 * form, e.g. "Title", "Abstract", "Author names"), plus two fixed groups for manuscript data that
 * isn't a submission-form field. `jsonKey` groups pull their text from `submission->jsonKey`;
 * fixed groups supply a complete `expression` instead.
 *
 * Deliberately restricted to data already on the manuscripts row (the submission JSONB, short_id,
 * meta.source) so that generating snippets never needs to join out to other tables (teams/
 * team_members/invitations/users), matching what `manuscripts_searchable_text_trigger` populates
 * search_tsvector from -- so a search match always has a corresponding visible snippet. */
const buildSnippetFieldGroups = submissionForm => {
  const formFieldGroups = (submissionForm?.structure?.children ?? [])
    .filter(field => field.name?.startsWith('submission.'))
    .map((field, index) => {
      const jsonKey = field.name.slice('submission.'.length)
      return {
        alias: `snippet_field_${index}`,
        field: field.shortDescription || field.title || jsonKey,
        jsonKey,
        // For Select/RadioGroup/CheckboxGroup-style fields, `submission` stores the option's
        // value (an internal code), not its label (what the user sees) -- resolve to the label.
        options:
          Array.isArray(field.options) && field.options.length > 0
            ? field.options
            : undefined,
      }
    })

  return [
    ...formFieldGroups,
    {
      alias: 'snippet_manuscript_id',
      field: 'Manuscript ID',
      expression: 'm.short_id::text',
    },
    {
      alias: 'snippet_article_body',
      // meta.source is the manuscript's typeset HTML body (from the Wax editor).
      field: 'Article body',
      expression: stripHtmlTags(`COALESCE(m.meta->>'source', '')`),
    },
  ]
}

/** Turns a raw search-query result row into the labeled snippet list the client renders,
 * omitting any field group that didn't actually match the search query. `submissionForm` must be
 * the same one used to build the query, so the field groups line up with the row's columns. */
const buildSearchSnippets = (row, submissionForm) =>
  buildSnippetFieldGroups(submissionForm)
    .filter(({ alias }) => row[alias])
    .map(({ alias, field }) => ({ field, html: row[alias] }))

/** This returns a modified array of reviews, omitting fields or entire reviews marked as
 * hidden from author, UNLESS the current user is the reviewer the review belongs to.
 * This does not consider whether the user is a groupManager/admin or editor of the manuscript:
 * that must be checked elsewhere.
 */
const stripConfidentialDataFromReviews = (
  reviews,
  reviewForm,
  decisionForm,
  sharedReviewersIds,
  userId,
  userRoles,
  manuscriptHasDecision,
) => {
  if (!reviewForm || !decisionForm) return []

  // Authors and general users can't see data that's hidden from users
  const reviewFieldsHiddenFromAuthor = reviewForm.structure.children
    .filter(f => f.hideFromAuthors === 'true')
    .map(f => f.name)

  const decisionFieldsHiddenFromAuthor = decisionForm.structure.children
    .filter(f => f.hideFromAuthors === 'true')
    .map(f => f.name)

  const decisionThreadedDiscussionFields = decisionForm.structure.children
    .filter(f => f.component === 'ThreadedDiscussion')
    .map(f => f.name)

  return reviews
    .map(review => {
      const hasPrivilegedAccess =
        review.userId === userId ||
        userRoles.collaborativeReviewer ||
        (review.isDecision && userRoles.reviewer && manuscriptHasDecision) ||
        userRoles.anyEditorOrManager ||
        review.isSharedWithCurrentUser

      if (!hasPrivilegedAccess && review.isHiddenFromAuthor) return null
      // Reviews are not made available to the author until after the decision
      if (!hasPrivilegedAccess && !review.isDecision && !manuscriptHasDecision)
        return null
      // TODO Two other unprivileged cases we should return null for:
      // - if the review is not a decision and it hasn't been completed;
      // - if the current user is not the manuscript author and the manuscript hasn't yet been published.

      const r = { ...review, jsonData: ensureJsonIsParsed(review.jsonData) }
      if (hasPrivilegedAccess) return r
      if (r.isHiddenReviewerName) r.userId = null

      const hiddenFields = r.isDecision
        ? decisionFieldsHiddenFromAuthor
        : reviewFieldsHiddenFromAuthor

      const filteredJsonData = {}

      Object.entries(r.jsonData).forEach(([key, value]) => {
        // ThreadedDiscussions in decisions are shown even before the decision is complete,
        // in order that the discussion can continue.
        const isThreadedDiscussionFieldInDecision =
          r.isDecision && decisionThreadedDiscussionFields.includes(key)

        const isVisible =
          !hiddenFields.includes(key) &&
          (manuscriptHasDecision || isThreadedDiscussionFieldInDecision)

        if (isVisible) filteredJsonData[key] = value
      })
      r.jsonData = filteredJsonData
      return r
    })
    .filter(Boolean)
}

/** Get evaluations as
 * [
 *  [submission.review1, submission.review1date],
 *  [submission.review2, submission.review2date],
 *  ...,
 *  [submission.summary, submission.summarydate]
 * ]
 * These are evaluations in the submission form, NOT normal reviews. */
const getEvaluationsAndDates = manuscript => {
  const evaluationValues = Object.entries(manuscript.submission)
    .filter(
      ([prop]) =>
        !Number.isNaN(Number(prop.split('review')[1])) &&
        prop.includes('review'),
    )
    .map(([propName, value]) => [
      value,
      manuscript.submission[`${propName}date`],
    ])

  evaluationValues.push([
    manuscript.submission.summary,
    manuscript.submission.summarydate,
  ])

  return evaluationValues
}

const hasElifeStyleEvaluations = manuscript => {
  const evaluations = getEvaluationsAndDates(manuscript)
  return evaluations.map(checkIsAbstractValueEmpty).some(isEmpty => !isEmpty)
}

/** Checks if the field exists in the form and is validly named (not causing risk of sql injection),
 * and if so returns the field name.
 * Also returns valuesAreKeyedObjects, which indicates whether values for this field
 * are key-value pairs as opposed to strings.
 */
const getSafelyNamedJsonbFieldInfo = (fieldName, submissionForm) => {
  if (!fieldName.startsWith('submission.')) return null

  const field =
    submissionForm &&
    submissionForm.structure.children.find(f => f.name === fieldName)

  if (!field) {
    logger.warn(`Ignoring unknown field "${fieldName}"`)
    return null
  }

  const name = fieldName.split('submission.')[1]

  if (!/^\$?[a-zA-Z]\w*$/.test(name)) {
    logger.warn(`Ignoring unsupported field "${fieldName}"`)
    return null
  }

  return {
    name,
    valuesAreKeyedObjects: !!field.options,
  }
}

/** Like getSafelyNamedJsonbFieldInfo, but only returns a result for DatePicker fields --
 * these are stored as plain 'yyyy-MM-dd' strings (see client's DatePicker.jsx), so they can
 * be range-filtered the same way as the 'created'/'updated' columns. */
const getSafelyNamedJsonbDateFieldInfo = (fieldName, submissionForm) => {
  const jsonbField = getSafelyNamedJsonbFieldInfo(fieldName, submissionForm)
  if (!jsonbField) return null

  const field = submissionForm.structure.children.find(
    f => f.name === fieldName,
  )

  return field.component === 'DatePicker' ? jsonbField : null
}

/** Check that the field exists and is not dangerously named (to avoid sql injection) */
const isValidNonJsonbField = (fieldName, submissionForm) => {
  if (!/^[a-zA-Z]\w*$/.test(fieldName)) {
    logger.warn(`Ignoring unsupported field "${fieldName}"`)
    return false
  }

  if (
    !submissionForm ||
    submissionForm.structure.children.find(f => f.name === fieldName)
  ) {
    logger.warn(`Ignoring unknown field "${fieldName}"`)
    return false
  }

  return true
}

/** Filtering function to discard items with duplicate fields */
const discardDuplicateFields = (item, index, self) =>
  self.findIndex(x => x.field === item.field) === index

/** Add a query component, with parameters.
 * This is used for building up the components of SELECT, FROM, WHERE and ORDER BY clauses. */
const addItem = (collection, rawFragment, params) => {
  collection.rawFragments.push(rawFragment)
  collection.params.push(...params)
}

/** Apply a specified ordering to the query.
 * This doesn't apply search rank ordering, which is done elsewhere.
 */
const applySortOrder = ({ field, isAscending }, submissionForm, addOrder) => {
  const sortDirection = isAscending ? '' : ' DESC'
  const jsonbField = getSafelyNamedJsonbFieldInfo(field, submissionForm)

  if (jsonbField) {
    const { name: jsonName } = jsonbField
    addOrder(
      `LOWER(${stripHtmlTags('m.submission->>?')})${sortDirection}`,
      jsonName,
    )
  } else if (isValidNonJsonbField(field, submissionForm)) {
    let sortingField = ''
    if (field === 'created') sortingField = 'COALESCE(p.created, m.created)'
    else if (field === 'shortId') sortingField = 'm.short_id'
    else if (field === 'updated') sortingField = 'm.updated'
    else logger.warn(`Could not sort on field "${field}"`)

    addOrder(`${sortingField}${sortDirection}`)
  } else {
    logger.warn(`Could not sort on field "${field}`)
  }

  addOrder(`m.short_id${sortDirection}`) // Secondary ordering
}

/** Apply all the specified filters to the query,
 * except for the special "search" filter which is dealt with separately. */
const applyFilters = (
  /** Array of {field, value} objects */
  filters,
  submissionForm,
  /** Function to add a WHERE clause to SQL query. Arguments are: (rawCondition, ...params). Each '?' in the rawCondition needs a corresponding param. */
  addWhere,
  /** The local timezone offset */
  timezoneOffsetMinutes,
) => {
  filters
    .filter(discardDuplicateFields)
    .filter(f => f.field !== URI_SEARCH_PARAM)
    .forEach(filter => {
      if (['created', 'updated'].includes(filter.field)) {
        try {
          const parts = filter.value.split('-')
          let filterField = ''

          if (filter.field === 'created') {
            filterField = `COALESCE(p.${filter.field}, m.${filter.field})`
          } else {
            filterField = `m.${filter.field}`
          }

          const dateFrom = getStartOfDay(
            compactStringToDate(parts[0], timezoneOffsetMinutes),
            timezoneOffsetMinutes,
          )

          const dateTo = getEndOfDay(
            compactStringToDate(parts[1], timezoneOffsetMinutes),
            timezoneOffsetMinutes,
          )

          addWhere(`${filterField} >= ?`, dateFrom.toISOString())
          addWhere(`${filterField} <= ?`, dateTo.toISOString())
          /* eslint-disable-next-line */
        } catch (error) {
          logger.warn(
            `Could not filter ${filter.field} by value '${filter.value}': could not parse as a date range.`,
          )
        }

        return
      }

      const jsonbDateField = getSafelyNamedJsonbDateFieldInfo(
        filter.field,
        submissionForm,
      )

      if (jsonbDateField) {
        try {
          const parts = filter.value.split('-')

          // Unlike created/updated (real timestamptz columns), the stored value has no time
          // component, so compare plain 'yyyy-MM-dd' boundaries rather than start/end-of-day
          // timestamps.
          const dateFrom = dateToIso8601(
            compactStringToDate(parts[0], timezoneOffsetMinutes),
          )

          const dateTo = dateToIso8601(
            compactStringToDate(parts[1], timezoneOffsetMinutes),
          )

          addWhere(`m.submission->>? >= ?`, jsonbDateField.name, dateFrom)
          addWhere(`m.submission->>? <= ?`, jsonbDateField.name, dateTo)
          /* eslint-disable-next-line */
        } catch (error) {
          logger.warn(
            `Could not filter ${filter.field} by value '${filter.value}': could not parse as a date range.`,
          )
        }

        return
      }

      if (!/^[\w :./,()\-<>=_]+$/.test(filter.value)) {
        logger.warn(
          `Ignoring filter "${filter.field}" with illegal value "${filter.value}"`, // To prevent code injection!
        )
        return // i.e., continue.
      }

      const jsonbField = getSafelyNamedJsonbFieldInfo(
        filter.field,
        submissionForm,
      )

      const values = filter.value.split(',')

      if (jsonbField) {
        const { name: jsonName, valuesAreKeyedObjects: isKeyed } = jsonbField

        if (isKeyed) {
          addWhere(
            `(${values.map(() => `(m.submission->?)::jsonb \\? ?`).join(' OR ')})`,
            ...values.flatMap(value => [jsonName, value]),
          )
        } else {
          addWhere(
            `m.submission->>? IN (${values.map(() => '?').join(', ')})`,
            jsonName,
            ...values,
          )
        }
      } else if (filter.field === 'status') {
        addWhere(`m.status IN (${values.map(() => '?').join(', ')})`, ...values)
      } else if (filter.field === 'archived') {
        // ignore: this is handled elsewhere
      } else {
        logger.warn(
          `Could not filter on field "${filter.field}" by value "${filter.value}"`,
        )
      }
    })
}

/** Builds a raw query string and an array of params, based on the requested filtering, sorting, offset and limit.
 * If manuscriptIDs is specified, then the query is restricted to those IDs.
 * Returns [query, params]
 */
const buildQueryForManuscriptSearchFilterAndOrder = (
  sort,
  offset,
  limit,
  filters,
  archived,
  submissionForm,
  timezoneOffsetMinutes,
  manuscriptIDs = null,
  groupId = null,
) => {
  // These keep track of the various terms we're adding to SELECT, FROM, WHERE and ORDER BY, as well as params.
  const selectItems = { rawFragments: [], params: [] }
  const whereItems = { rawFragments: [], params: [] }
  const orderItems = { rawFragments: [], params: [] }
  const addSelect = (frag, ...params) => addItem(selectItems, frag, params)
  const addWhere = (frag, ...params) => addItem(whereItems, frag, params)
  const addOrder = (frag, ...params) => addItem(orderItems, frag, params)

  addSelect('id')
  addSelect('count(1) OVER() AS full_count') // Count of all results (not just this page)
  addWhere('m.created = sub.latest_created')
  if (archived) addWhere('m.is_hidden IS TRUE')
  else addWhere('m.is_hidden IS NOT TRUE')

  let subQuery = `WITH subQuery AS (
    SELECT short_id, MAX(created) AS latest_created
    FROM manuscripts
    WHERE group_id = '${groupId}'
    GROUP BY short_id
  )`

  let manuscriptIds
  let setOrderOnRank = ''

  if (manuscriptIDs) {
    manuscriptIds = manuscriptIDs.map(id => `'${id}'`)
  }

  if (Array.isArray(manuscriptIds) && manuscriptIds.length > 0) {
    subQuery = `WITH subQuery AS (
      SELECT short_id, MAX(created) AS latest_created
      FROM manuscripts
      WHERE id IN (${manuscriptIds})
      OR parent_id IN (${manuscriptIds})
      AND group_id = '${groupId}'
      GROUP BY short_id
    )`
  }

  if (groupId) {
    addWhere('m.group_id = ?', groupId)
  }

  const searchFilter = filters.find(f => f.field === URI_SEARCH_PARAM)

  const searchQuery =
    searchFilter && formatSearchQueryForPostgres(searchFilter.value)

  if (searchQuery) {
    addSelect(
      `ts_rank_cd(m.search_tsvector, to_tsquery('english', ?)) AS rank`,
      searchQuery,
    )

    buildSnippetFieldGroups(submissionForm).forEach(
      ({ jsonKey, expression, alias, options }) => {
        let textExpression
        let textExpressionParams

        if (jsonKey && options) {
          // Resolve stored value(s) to their option label(s), falling back to the raw value if
          // it no longer matches any current option. Mirrors the equivalent logic in
          // manuscripts_searchable_text_trigger, which does this at write time for matching.
          textExpression = stripHtmlTags(`CASE jsonb_typeof(m.submission->?)
            WHEN 'array' THEN (
              SELECT string_agg(COALESCE(
                (SELECT o->>'label' FROM jsonb_array_elements(?::jsonb) o WHERE o->>'value' = elem.value),
                elem.value
              ), ' ')
              FROM jsonb_array_elements_text(m.submission->?) AS elem(value)
            )
            ELSE COALESCE(
              (SELECT o->>'label' FROM jsonb_array_elements(?::jsonb) o WHERE o->>'value' = (m.submission->>?)),
              m.submission->>?
            )
          END`)

          const optionsJson = JSON.stringify(options)
          textExpressionParams = [
            jsonKey,
            optionsJson,
            jsonKey,
            optionsJson,
            jsonKey,
            jsonKey,
          ]
        } else if (jsonKey) {
          textExpression = stripHtmlTags(
            `concatenate_text_values(m.submission->?)`,
          )
          textExpressionParams = [jsonKey]
        } else {
          textExpression = expression
          textExpressionParams = []
        }

        addSelect(
          `CASE WHEN to_tsvector('english', ${textExpression}) @@ to_tsquery('english', ?)
            THEN ts_headline('english', ${textExpression}, to_tsquery('english', ?), 'MaxFragments=2, MaxWords=20, MinWords=5')
            ELSE NULL END AS ${alias}`,
          ...textExpressionParams,
          searchQuery,
          ...textExpressionParams,
          searchQuery,
        )
      },
    )

    addWhere(`m.search_tsvector @@ to_tsquery('english', ?)`, searchQuery)

    if (!sort) {
      setOrderOnRank = 'ORDER BY rank DESC'
    }
  }

  if (sort) {
    applySortOrder(sort, submissionForm, addOrder)
  } else {
    // Give it some order to prevent it changing on refetch.
    addOrder('COALESCE(p.created, m.created) DESC')
    addOrder('m.short_id DESC')
  }

  applyFilters(filters, submissionForm, addWhere, timezoneOffsetMinutes)

  const query = `
    SELECT ${selectItems.rawFragments.join(', ')}
    FROM (
      SELECT m.*
      FROM manuscripts AS m
      INNER JOIN subQuery AS sub ON m.short_id = sub.short_id
      LEFT JOIN manuscripts AS p ON m.parent_id = p.id
      WHERE ${whereItems.rawFragments.join(' AND ')}
      ORDER BY ${orderItems.rawFragments.join(', ')}
    ) AS m
    ${setOrderOnRank}
    LIMIT ${limit}
    OFFSET ${offset};`

  const params = selectItems.params.concat(whereItems.params, orderItems.params)

  return [subQuery + query, params]
}

/** Get the current version of a ThreadedDiscussion comment */
const getPublishableTextFromComment = commentObject => {
  if (!commentObject.commentVersions || !commentObject.commentVersions.length)
    return ''

  return commentObject.commentVersions[commentObject.commentVersions.length - 1]
    .comment
}

/** For a given form and corresponding data object, generate entries in the fieldsMap for all fields.
 * fieldsMap will be given a nested structure of keys (field names) and values. If objectId is supplied,
 * that will be inserted at the top of the nested structure. objectId may be a uuid, or may simply be a
 * text name such as 'decision'.
 * Currently, some data is added to the map twice: once with a uuid at the top, and once with a simple string
 * (or nothing) at the top. This permits the resulting map to be used in different circumstances.
 */
const addAllFieldsToTemplatingMap = (
  fieldsMap,
  objectId,
  formData,
  form,
  threadedDiscussions,
) => {
  form.structure.children.forEach(field => {
    let value = get(formData, field.name)

    if (field.component === 'ThreadedDiscussion') {
      if (!threadedDiscussions) return
      const discussion = threadedDiscussions.find(td => td.id === value)
      if (!discussion) return

      discussion.threads.forEach(thread => {
        thread.comments.forEach(comment => {
          const text = getPublishableTextFromComment(comment)
          set(
            fieldsMap,
            `${objectId ? `${objectId}.` : ''}${field.name}:${comment.id}`,
            text,
          )
        })
      })
      return
    }

    // we might be dealing with a review
    if (value === undefined) {
      value = get(ensureJsonIsParsed(formData?.jsonData) ?? {}, field.name)
    }

    const content = getPublishableTextFromValue(value, field)
    set(fieldsMap, `${objectId ? `${objectId}.` : ''}${field.name}`, content)
  })
}

/** Resolve inconsistencies in URI representations */
const getPreprintUri = manuscript => {
  let uri = manuscript.submission.$sourceUri

  if (typeof uri !== 'string') return null
  // Hypothesis autoredirects the following URIs, which is a pain:
  if (uri.startsWith('https://biorxiv.org/'))
    uri = uri.replace('https://biorxiv.org/', 'https://www.biorxiv.org/')
  return uri
}

/** Create a nested object with keys and values for all fields (and ThreadedDiscussion comments)
 * of the given manuscript, its reviews and decisions. This object is constructed as a lookup
 * for the Handlebar templating engine.
 */
const getFieldsMapForTemplating = (
  manuscript,
  submissionForm,
  reviewForm,
  decisionForm,
) => {
  // TODO Currently we have different code using two different styles:
  // '362521f6-4e57-4102-9c36-3f74f31ebef1.submission.$authors', and
  // 'submission.$authors'.
  // We should simplify, so we only use the object IDs when referring to reviews
  // (since there may be multiple reviews).

  const fieldsMap = {
    shortId: manuscript.shortId,
    status: manuscript.status,
    meta: {
      title: manuscript.submission.$title || '', // TODO remove once we've migrated all templates
      abstract: manuscript.submission.$abstract || '', // TODO remove once we've migrated all templates
    },
    doi: manuscript.submission.$doi || '',
    uri: getPreprintUri(manuscript) || '',
    title: manuscript.submission.$title || '',
  }

  // Duplicate these entries with keys containing id, e.g. '362521f6-4e57-4102-9c36-3f74f31ebef1.shortId'
  Object.entries(fieldsMap).forEach(([key, val]) => {
    fieldsMap[`${manuscript.id}.${key}`] = val
  })

  // Add all submission fields referenced as e.g. '362521f6-4e57-4102-9c36-3f74f31ebef1.submission.$authors'
  addAllFieldsToTemplatingMap(
    fieldsMap,
    manuscript.id,
    manuscript,
    submissionForm,
    manuscript.threadedDiscussions,
  )
  // Add all submission fields referenced as e.g. 'submission.$authors'
  addAllFieldsToTemplatingMap(
    fieldsMap,
    null,
    manuscript,
    submissionForm,
    manuscript.threadedDiscussions,
  )
  // Add all review and decision fields referenced as e.g. '913ed8c4-794e-470e-9214-9c77d90e0144.comment'
  manuscript.reviews.forEach(review =>
    addAllFieldsToTemplatingMap(
      fieldsMap,
      review.id,
      review,
      review.isDecision ? decisionForm : reviewForm,
      manuscript.threadedDiscussions,
    ),
  )
  // Add all decision fields referenced as e.g. 'decision.verdict'
  const decision = manuscript.reviews.find(r => r.isDecision)
  if (decision)
    addAllFieldsToTemplatingMap(
      fieldsMap,
      'decision',
      decision,
      decisionForm,
      manuscript.threadedDiscussions,
    )

  return fieldsMap
}

/** Expand all handlebars templates in the content of published artifacts */
const applyTemplatesToArtifacts = (
  artifacts,
  manuscript,
  submissionForm,
  reviewForm,
  decisionForm,
) => {
  const fieldsMap = artifacts.length
    ? getFieldsMapForTemplating(
        manuscript,
        submissionForm,
        reviewForm,
        decisionForm,
      )
    : null

  return artifacts.map(artifact => ({
    ...artifact,
    content: Handlebars.compile(artifact.content, { noEscape: true })(
      fieldsMap,
    ),
  }))
}

module.exports = {
  buildQueryForManuscriptSearchFilterAndOrder,
  buildSearchSnippets,
  stripConfidentialDataFromReviews,
  hasElifeStyleEvaluations,
  applyTemplatesToArtifacts,
  getFieldsMapForTemplating,
}
