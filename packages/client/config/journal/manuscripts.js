/*
Journals may want to display their manuscript tables with different columns
*/
const editorColumns = columns => {
  if (columns.length === 0) {
    return [
      'shortId',
      'overdueTooltip',
      'submission.$title',
      'status',
      'manuscriptVersions',
      'statusCounts',
      'lastUpdated',
      'editorLinks',
    ]
  }

  return columns.concat([
    'overdueTooltip',
    'statusCounts',
    'lastUpdated',
    'editorLinks',
  ])
}

const authorColumns = columns => {
  if (columns.length === 0) {
    return [
      'shortId',
      'submission.$title',
      'status',
      'created',
      'updated',
      'authorProofingLink',
    ]
  }

  return columns.concat(['authorProofingLink'])
}

const reviewerColumns = columns => {
  if (columns.length === 0) {
    return [
      'shortId',
      'submission.$title',
      'reviewerStatusBadge',
      'reviewerLinks',
    ]
  }

  return columns.concat(['reviewerStatusBadge', 'reviewerLinks'])
}

export { authorColumns, editorColumns, reviewerColumns }
