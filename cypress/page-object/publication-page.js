/// <reference types="Cypress" />
/**
 * Page object representing the list of published articles.
 */
const PUBLICATION_TITLE = 'General__Title'

export const PublicationPage = {
  getPublicationTitle() {
    return cy.getByContainsClass(PUBLICATION_TITLE).invoke('text')
  },
}
