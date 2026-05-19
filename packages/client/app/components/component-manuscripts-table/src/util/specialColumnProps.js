/* eslint-disable new-cap */

import i18next from 'i18next'
import {
  DefaultField,
  RowItemCheckbox,
  TitleWithAbstractAsTooltip,
  FilterableStatusBadge,
  StatusBadge,
  LabelsOrSelectButton,
  Submitter,
  Editors,
  Actions,
  SubmitChevron,
  ReviewerItemLinks,
  EditorItemLinks,
  ReviewStatusDonut,
  OverdueTooltip,
  LastReviewerUpdated,
  ReviewerStatusBadge,
} from '../cell-components'
import reviewFilterOptions from '../../../../../config/journal/review-status'
import AuthorProofingLink from '../cell-components/AuthorProofingLink'

import localizeReviewFilterOptions from '../../../../shared/localizeReviewFilterOptions'

/**
 * buildSpecialColumnProps: Build the special components for specific form fields
 * @param {object} specialComponentValues values needed for specific components
 * @returns {object} The built special components
 */
const buildSpecialColumnProps = (
  specialComponentValues,
  config,
  fieldDefinitions,
  doUpdateManuscript,
  archived,
) => {
  const {
    deleteManuscript,
    tryPublishManuscript,
    urlFrag,
    selectedNewManuscripts,
    toggleNewManuscriptCheck,
    setReadyToEvaluateLabel,
    unsetCustomStatus,
    reviewerRespond,
    getMainActionLink,
    currentUser,
    updateReviewerStatus,
  } = specialComponentValues

  const LocalizedReviewFilterOptions = localizeReviewFilterOptions(
    reviewFilterOptions,
    i18next.t,
  )

  const specialColumnProps = {
    shortId: {
      title: i18next.t('manuscriptsTable.Manuscript number'),
      canSort: true,
      defaultSortDirection: 'DESC',
      flex: '0 1 6em',
    },
    created: {
      title: i18next.t('manuscriptsTable.Created'),
      canSort: true,
      canFilterByDateRange: true,
      defaultSortDirection: 'DESC',
      flex: '0.25 1 8em',
    },
    updated: {
      title: i18next.t('manuscriptsTable.Updated'),
      canSort: true,
      canFilterByDateRange: true,
      defaultSortDirection: 'DESC',
      flex: '0.25 1 8em',
    },
    lastUpdated: {
      title: i18next.t('manuscriptsTable.lastReviewerStatusUpdate'),
      component: LastReviewerUpdated,
      flex: '0.25 1 8em',
    },
    'submission.adaState': {
      title: i18next.t('manuscriptsTable.adaState'),
      flex: '0.25 1 21em',
      component: StatusBadge,
      centered: true,
    },
    'submission.$doi': {
      title: i18next.t('formBuilder.fieldOpts.doi'),
      flex: '0.25 1 21em',
      centered: true,
    },
    status: {
      title: i18next.t('manuscriptsTable.Status'),
      filterOptions: ['journal', 'prc'].includes(config?.instanceName)
        ? [
            { label: i18next.t('msStatus.new'), value: 'new' },
            { label: i18next.t('msStatus.submitted'), value: 'submitted' },
            { label: i18next.t('msStatus.accepted'), value: 'accepted' },
            { label: i18next.t('msStatus.rejected'), value: 'rejected' },
            { label: i18next.t('msStatus.revise'), value: 'revise' },
            { label: i18next.t('msStatus.revising'), value: 'revising' },
            { label: i18next.t('msStatus.published'), value: 'published' },
            { label: i18next.t('msStatus.unpublished'), value: 'unpublished' },
            {
              label: i18next.t('msStatus.assigned'),
              value: 'assigned',
            },
            {
              label: i18next.t('msStatus.inProgress'),
              value: 'inProgress',
            },
            {
              label: i18next.t('msStatus.completed'),
              value: 'completed',
            },
            {
              label: i18next.t('msStatus.underEmbargo'),
              value: 'underEmbargo',
            },
            {
              label: i18next.t('msStatus.embargoReleased'),
              value: 'embargoReleased',
            },
          ]
        : [
            { label: i18next.t('msStatus.new'), value: 'new' },
            { label: i18next.t('msStatus.submitted'), value: 'submitted' },
            { label: i18next.t('msStatus.evaluated'), value: 'evaluated' },
            { label: i18next.t('msStatus.published'), value: 'published' },
            { label: i18next.t('msStatus.unpublished'), value: 'unpublished' },
            {
              label: i18next.t('msStatus.assigned'),
              value: 'assigned',
            },
            {
              label: i18next.t('msStatus.inProgress'),
              value: 'inProgress',
            },
            {
              label: i18next.t('msStatus.completed'),
              value: 'completed',
            },
            {
              label: i18next.t('msStatus.underEmbargo'),
              value: 'underEmbargo',
            },
            {
              label: i18next.t('msStatus.embargoReleased'),
              value: 'embargoReleased',
            },
          ],
      flex: '0.25 1 21em',
      component: FilterableStatusBadge,
      centered: true,
    },
    manuscriptVersions: {
      title: i18next.t('manuscriptsTable.Version'),
      flex: '0 1 6em',
      centered: true,
    },
    author: {
      title: i18next.t('manuscriptsTable.Author'),
      flex: '0 1 16em',
      component: Submitter,
    },
    submitter: {
      title: i18next.t('manuscriptsTable.Author'),
      flex: '0 1 16em',
      component: Submitter,
    }, // alias of 'author'
    editor: {
      title: i18next.t('manuscriptsTable.Editor'),
      flex: '0 1 12em',
      component: Editors,
    },
    actions: {
      flex: '0 1 8em',
      component: Actions,
      extraProps: {
        archived,
        config,
        deleteManuscript,
        tryPublishManuscript,
        urlFrag,
      },
    },
    submitChevron: {
      flex: '0 1 6em',
      component: SubmitChevron,
      extraProps: {
        urlFrag,
      },
    },
    reviewerStatusBadge: {
      title: i18next.t('manuscriptsTable.Your Status'),
      flex: '0.25 1 10em',
      canSort: true,
      defaultSortDirection: 'DESC',
      filterOptions: LocalizedReviewFilterOptions,
      component: ReviewerStatusBadge,
      centered: true,
      extraProps: {
        currentUser,
      },
    },
    statusCounts: {
      title: i18next.t('manuscriptsTable.Reviewer Status'),
      flex: '0.25 1 10em',
      centered: true,
      component: ReviewStatusDonut,
    },
    editorLinks: {
      title: i18next.t('manuscriptsTable.Actions'),
      flex: '0 1 10em',
      component: EditorItemLinks,
      extraProps: {
        urlFrag,
      },
    },
    authorProofingLink: {
      title: 'Actions',
      flex: '0 1 10em',
      centered: true,
      component: AuthorProofingLink,
      extraProps: {
        urlFrag,
        currentUser,
      },
    },
    reviewerLinks: {
      title: 'Action',
      flex: '0 1 10em',
      centered: true,
      component: ReviewerItemLinks,
      extraProps: {
        urlFrag,
        reviewerRespond,
        currentUser,
        updateReviewerStatus,
        getMainActionLink,
      },
    },
    overdueTooltip: {
      flex: '0 0 1.5em',
      padding: '0',
      component: OverdueTooltip,
    },
    rowItemCheckbox: {
      flex: '0 1 2em',
      component: RowItemCheckbox,
      extraProps: { selectedNewManuscripts, toggleNewManuscriptCheck },
    },
    'submission.topics': { flex: '0 1 10em' },
    'submission.$customStatus': {
      flex: '0.25 1 15em',
      extraProps: { setReadyToEvaluateLabel, unsetCustomStatus },
      component:
        config?.manuscript?.labelColumn && !archived
          ? props =>
              LabelsOrSelectButton({
                ...props,
                options: fieldDefinitions['submission.$customStatus']?.options,
                doUpdateManuscript,
              })
          : DefaultField,
    },
    'submission.label': { flex: '0.2 1 10em' },
    'submission.journal': { flex: '0.2 1 12em' },
    titleAndAbstract: {
      component: TitleWithAbstractAsTooltip,
      title: i18next.t('manuscriptsTable.Title'),
    },
  }

  return specialColumnProps
}

export default buildSpecialColumnProps
