import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager, DbTestUtils } from '@coko/server'

import Group from '../../../models/group/group.model'
import Manuscript from '../../../models/manuscript/manuscript.model'
import Form from '../../../models/form/form.model'
import {
  buildQueryForManuscriptSearchFilterAndOrder,
  buildSearchSnippets,
} from '../manuscriptUtils'

/** Runs buildQueryForManuscriptSearchFilterAndOrder for the given form/search term/group and
 * executes it, returning the raw result rows -- the same shape buildSearchSnippets consumes. */
const search = async (submissionForm, searchValue, groupId): Promise<any[]> => {
  const [query, params] = buildQueryForManuscriptSearchFilterAndOrder(
    null,
    0,
    10,
    [{ field: 'search', value: searchValue }],
    false,
    submissionForm,
    0,
    null,
    groupId,
  ) as [string, any[]]

  const { rows } = await db.raw(query, params)
  return rows
}

describe('buildSearchSnippets', () => {
  const submissionForm = {
    structure: {
      children: [
        { name: 'submission.$title', title: 'Title' },
        { name: 'submission.custom', shortDescription: 'Custom Field' },
        { name: 'submission.plain' },
      ],
    },
  }

  it('returns an empty list when no field group matched', () => {
    // A real row always has every group's column present, just null when unmatched -- a search
    // with zero matches still returns a row shaped like this, not an empty object.
    const row = {
      snippet_field_0: null,
      snippet_field_1: null,
      snippet_field_2: null,
      snippet_manuscript_id: null,
      snippet_article_body: null,
    }

    expect(buildSearchSnippets(row, submissionForm)).toEqual([])
  })

  it('includes only the field groups with a non-null snippet, in declaration order', () => {
    const row = {
      snippet_field_0: '<b>Wombat</b> title',
      snippet_field_1: null,
      snippet_field_2: null,
      snippet_manuscript_id: null,
      snippet_article_body: '<b>Body</b> text',
    }

    expect(buildSearchSnippets(row, submissionForm)).toEqual([
      { field: 'Title', html: '<b>Wombat</b> title' },
      { field: 'Article body', html: '<b>Body</b> text' },
    ])
  })

  it('labels each field with shortDescription, falling back to title, then the raw field key', () => {
    const row = {
      snippet_field_0: 'a', // maps to $title
      snippet_field_1: 'b', // maps to custom
      snippet_field_2: 'c', // maps to plain
      snippet_manuscript_id: null,
      snippet_article_body: null,
    }

    expect(buildSearchSnippets(row, submissionForm)).toEqual([
      { field: 'Title', html: 'a' },
      { field: 'Custom Field', html: 'b' },
      { field: 'plain', html: 'c' },
    ])
  })

  it('always includes the fixed Manuscript ID and Article body groups, even with no form fields', () => {
    const emptyForm = { structure: { children: [] } }
    const row = { snippet_manuscript_id: '42', snippet_article_body: 'body' }

    expect(buildSearchSnippets(row, emptyForm)).toEqual([
      { field: 'Manuscript ID', html: '42' },
      { field: 'Article body', html: 'body' },
    ])
  })
})

describe('buildQueryForManuscriptSearchFilterAndOrder: placeholder/param safety', () => {
  // A structural regression guard: a literal `?` anywhere in the generated SQL (e.g. from a regex
  // like `<b>|</b>`, or a JSONB operator) gets miscounted by knex as an extra bind placeholder,
  // silently breaking every search. This doesn't require a DB -- it just inspects the built
  // query/params shape for several representative form configurations.

  const forms = [
    { structure: { children: [] } },
    {
      structure: {
        children: [
          { name: 'submission.$title', title: 'Title' },
          {
            name: 'submission.type',
            title: 'Type',
            options: [{ value: 'a', label: 'A' }],
          },
          {
            name: 'submission.topics',
            title: 'Topics',
            options: [
              { value: 'a', label: 'A' },
              { value: 'b', label: 'B' },
            ],
          },
        ],
      },
    },
  ]

  it.each(forms)(
    'produces exactly as many `?` placeholders as bound params',
    submissionForm => {
      const [query, params] = buildQueryForManuscriptSearchFilterAndOrder(
        null,
        0,
        10,
        [{ field: 'search', value: 'anything' }],
        false,
        submissionForm,
        0,
        null,
        'some-group-id',
      ) as [string, any[]]

      const placeholderCount = (query.match(/\?/g) || []).length
      expect(placeholderCount).toBe(params.length)
    },
  )

  // A `?` in the search term itself travels as a bound parameter, never spliced into the SQL
  // text -- unlike the two real bugs above (a stray `?` baked into the query-building code: a
  // regex, a JSONB operator), a `?` in user-supplied data can't affect knex's placeholder count,
  // regardless of which field group's code path it flows through.
  it('still balances placeholders and params when the search term itself contains a `?`', () => {
    const [query, params] = buildQueryForManuscriptSearchFilterAndOrder(
      null,
      0,
      10,
      [{ field: 'search', value: 'is it?' }],
      false,
      forms[1],
      0,
      null,
      'some-group-id',
    ) as [string, any[]]

    const placeholderCount = (query.match(/\?/g) || []).length
    expect(placeholderCount).toBe(params.length)
  })
})

describe('buildQueryForManuscriptSearchFilterAndOrder + buildSearchSnippets', () => {
  let group: Group

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    group = await Group.insert({})
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
    await db.destroy()
  })

  const titleOnlyForm = {
    structure: {
      children: [{ name: 'submission.$title', title: 'Title' }],
    },
  }

  it('matches and highlights a plain text field', async () => {
    const manuscript = await Manuscript.insert({
      groupId: group.id,
      submission: { $title: 'Wombat Manuscript Title' },
    })

    const rows = await search(titleOnlyForm, 'wombat', group.id)

    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe(manuscript.id)

    expect(buildSearchSnippets(rows[0], titleOnlyForm)).toEqual([
      { field: 'Title', html: expect.stringContaining('<b>Wombat</b>') },
    ])
  })

  it('strips HTML tags from the article body before highlighting', async () => {
    await Manuscript.insert({
      groupId: group.id,
      submission: {},
      meta: { source: '<p class="paragraph">Bacon ipsum dolor</p>' },
    })

    const rows = await search(titleOnlyForm, 'bacon', group.id)

    expect(rows).toHaveLength(1)

    const snippets = buildSearchSnippets(rows[0], titleOnlyForm)
    const articleBody = snippets.find(s => s.field === 'Article body')

    expect(articleBody?.html).toContain('<b>Bacon</b>')
    expect(articleBody?.html).not.toContain('<p')
    expect(articleBody?.html).not.toContain('class=')
  })

  it('matches an options field by its label rather than its stored value', async () => {
    const optionsForm = {
      structure: {
        children: [
          {
            name: 'submission.objectType',
            title: 'Type',
            options: [
              { value: 'ds', label: 'Dataset' },
              { value: 'sw', label: 'Software' },
            ],
          },
        ],
      },
    }

    // The trigger that populates search_tsvector resolves option values to labels by looking up
    // the group's submission form directly from the DB (not from the `optionsForm` object passed
    // to `search` below, which only affects the snippet headline) -- so a matching Form row has
    // to exist before the manuscript is inserted, or the raw value is all that gets indexed.
    // @ts-ignore
    await Form.insert({
      groupId: group.id,
      purpose: 'submit',
      category: 'submission',
      structure: optionsForm.structure,
    })

    await Manuscript.insert({
      groupId: group.id,
      submission: { objectType: 'ds' },
    })

    const labelRows = await search(optionsForm, 'dataset', group.id)
    expect(labelRows).toHaveLength(1)

    expect(buildSearchSnippets(labelRows[0], optionsForm)).toEqual([
      { field: 'Type', html: expect.stringContaining('<b>Dataset</b>') },
    ])

    // Searching by the raw stored value produces no snippet for this field, since the headline
    // is generated from the resolved label ("Dataset"), not the code ("ds").
    const valueRows = await search(optionsForm, 'ds', group.id)
    expect(valueRows).toHaveLength(1)

    const valueSnippets = buildSearchSnippets(valueRows[0], optionsForm)
    expect(valueSnippets.find(s => s.field === 'Type')).toBeUndefined()
  })

  it('resolves each value of a multi-select field to its own label', async () => {
    const multiSelectForm = {
      structure: {
        children: [
          {
            name: 'submission.topics',
            title: 'Topics',
            options: [
              { value: 'a', label: 'Alpha' },
              { value: 'b', label: 'Beta' },
              { value: 'c', label: 'Gamma' },
            ],
          },
        ],
      },
    }

    // See the note in the previous test: the trigger needs a matching Form row in the DB to
    // resolve option values to labels when computing search_tsvector.
    // @ts-ignore
    await Form.insert({
      groupId: group.id,
      purpose: 'submit',
      category: 'submission',
      structure: multiSelectForm.structure,
    })

    await Manuscript.insert({
      groupId: group.id,
      submission: { topics: ['a', 'b'] },
    })

    const rows = await search(multiSelectForm, 'beta', group.id)
    expect(rows).toHaveLength(1)

    expect(buildSearchSnippets(rows[0], multiSelectForm)).toEqual([
      { field: 'Topics', html: expect.stringContaining('<b>Beta</b>') },
    ])
  })

  it('falls back to the raw stored value if it no longer matches any current option', async () => {
    const staleOptionForm = {
      structure: {
        children: [
          {
            name: 'submission.legacyField',
            title: 'Legacy',
            options: [{ value: 'current', label: 'Current option' }],
          },
        ],
      },
    }

    await Manuscript.insert({
      groupId: group.id,
      submission: { legacyField: 'removedoption' },
    })

    const rows = await search(staleOptionForm, 'removedoption', group.id)
    expect(rows).toHaveLength(1)

    expect(buildSearchSnippets(rows[0], staleOptionForm)).toEqual([
      {
        field: 'Legacy',
        html: expect.stringContaining('<b>removedoption</b>'),
      },
    ])
  })
})
