/// <reference types="Cypress" />
import { submit, evaluate } from '../support/routes'
import { SubmissionFormPage } from './submission-form-page'

/**
 * Page object representing the available submission options:
 * submission through uploading a manuscript or through using an URL.
 */
const UPLOAD_MANUSCRIPT_BUTTON = 'card-upload-upload'
const SUBMIT_URL_BUTTON = 'card-button-skip'
const SUBMISSION_MESSAGE = 'body'

export const NewSubmissionPage = {
  getUploadManuscriptButton() {
    return cy.getByDataTestId(UPLOAD_MANUSCRIPT_BUTTON)
  },
  uploadManuscript(file) {
    this.getUploadManuscriptButton()
      .find('input[type=file]')
      .selectFile(file, { force: true })
  },
  getSubmitURLButton() {
    return cy.getByDataTestId(SUBMIT_URL_BUTTON)
  },
  clickSubmitURL() {
    this.getSubmitURLButton().click()
  },
  clickSubmitUrlAndWaitPageLoad() {
    this.clickSubmitURL()
    cy.url({ timeout: 30000 }).should('contain', submit)
    cy.awaitDisappearSpinner()
    SubmissionFormPage.getPageTitle().should('be.visible')
  },
  clickSubmitUrlAndWaitPageLoadElife() {
    this.clickSubmitURL()
    cy.url({ timeout: 30000 }).should('contain', evaluate)
    cy.awaitDisappearSpinner()
    SubmissionFormPage.getPageTitle().should('be.visible')
  },
  getSubmissionMessage() {
    return cy.get(SUBMISSION_MESSAGE).invoke('text')
  },
  setCustomStatusField(statusLabel) {
    cy.getByDataTestId('submission.$customStatus').first().scrollIntoView()
    cy.getByDataTestId('submission.$customStatus').first().click()
    cy.get('[data-testid="select-option"]').contains(statusLabel).click()
  },
}
