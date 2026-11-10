const DOI_PATH_PREFIX = 'https://doi.org/'

const ERROR_MESSAGES = {
  noDoiPrefix: 'Could not publish to Datacite, as no DOI prefix is configured.',
  noJournalName: 'Configuration Journal Name is not set',
  noArticleLocationPrefix:
    'Configuration needs to set the url where the doi will resolve',
  noSubmissionObject: 'Manuscript has no submission object',
  noSubmissionTitle: 'Manuscript has no submission.$title',
  noSubmissionAuthors: 'Manuscript has no submission.$authors field',
  authorsNotArray: 'Manuscript.submission.$authors is not an array',
  noResourceType: 'Manuscript has no submission.resourcetype',
}

// relatedIdentifiers (citations)
const CITATION_SELECTOR = 'p.ref'
const CITATION_DATA_STRUCTURE = 'data-structure'

module.exports = {
  DOI_PATH_PREFIX,
  ERROR_MESSAGES,
  CITATION_SELECTOR,
  CITATION_DATA_STRUCTURE,
}
