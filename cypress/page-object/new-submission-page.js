/// <reference types="Cypress" />
import { submit, evaluate } from '../support/routes'
import { SubmissionFormPage } from './submission-form-page'

/**
 * Page object representing the available submission options:
 * submission through uploading a manuscript or through using an URL.
 */
const UPLOAD_MANUSCRIPT_BUTTON = 'UploadManuscript__Info'
const SUBMIT_URL_BUTTON = 'submitUrl'
const SUBMISSION_MESSAGE = 'body'

export const NewSubmissionPage = {
  getUploadManuscriptButton() {
    return cy.getByContainsClass(UPLOAD_MANUSCRIPT_BUTTON)
  },
  clickUploadManuscript() {
    this.getUploadManuscriptButton().click()
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
    cy.getByDataTestId('submission.$customStatus').scrollIntoView()
    cy.getByDataTestId('submission.$customStatus').click()
    cy.get('[class*="react-select__option"]').contains(statusLabel).click()
  },
}
