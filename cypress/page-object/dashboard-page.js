/// <reference types="Cypress" />

/**
 * Page object which represents the Dashboard, which contains
 * a submission button in the top right corner,
 * My Submission section, To Review section & Manuscripts I'm editor of section.
 * Each of these sections contain their own lists (where available) of manuscripts.
 */

const BUTTON = 'button'
const HEADER = 'General__Heading'
const SECTION_TITLE = 'General__Title'
const SECTION_PLACEHOLDER = 'style__Placeholder'
const SUBMISSION_TITLE = '[name="submission.$title"] > div'
const SUBMISSION_BUTTON = '+ New submission'
const SUBMISSION_FILE_UPLOAD_INPUT = 'input[type=file]'
const SUBMISSION_CREATED = 'Submission created'

/* My Submissions */
const SUBMITTED_MANUSCRIPTS = '[class*=style__ClickableManuscriptsRow]'
const CREATE_NEW_VERSION_BUTTON = 'create-new-manuscript-version-button'

/* Submitted Info */
const DECISION_FIELDS = ':nth-child(1) > .General__Section-sc-1chiust-0 > div'

// 'To Review section'
const DO_REVIEW_BUTTON = '[name="reviewerLinks"] button'
const ACCEPT_REVIEW_BUTTON = 'accept-review'
const REJECT_REVIEW_BUTTON = 'reject-review'

// 'Manuscripts I'm editor of' section
const CONTROL_BUTTON = 'control-panel-team'
const MANUSCRIPT_NAV_BUTTON = '[href*="/admin/manuscripts"]'
const INVITED_REVIEWS_STATUS = 'invited'
const COMPLETED_REVIEWS_STATUS = 'completed'
const REJECTED_REVIEWS_STATUS = 'rejected'
const ACCEPTED_REVIEWS_STATUS = 'accepted'
const VERSION_TITLE = 'VersionTitle__Root-sc'
const ARTICLE_LINK = '[name="reviewerLinks"] button'
const DASHBOARD_TAB = '[data-test-id=tab-container]'

export const DashboardPage = {
  getSubmittedManuscript() {
    return cy.get(SUBMITTED_MANUSCRIPTS)
  },
  getSubmittedManuscripts(nth) {
    return cy.get(SUBMITTED_MANUSCRIPTS).eq(nth)
  },
  clickSubmittedManuscript(nth) {
    this.getSubmittedManuscripts(nth).click()
  },
  getSubmitButton() {
    return cy.get(BUTTON).contains(SUBMISSION_BUTTON)
  },
  getSubmissionFileUploadInput() {
    return cy.get(SUBMISSION_FILE_UPLOAD_INPUT)
  },
  confirmSubmissionCreated() {
    cy.contains(SUBMISSION_CREATED).should('exist')
  },
  clickSubmitButton() {
    this.getSubmitButton().click()
  },
  getHeader() {
    return cy.getByContainsClass(HEADER)
  },
  clickSubmit() {
    this.getSubmitButton().click()
  },
  getSectionTitleWithText(title) {
    return cy.getByContainsClass(SECTION_TITLE).contains(title)
  },
  getSubmissionTitle() {
    return cy.get(SUBMISSION_TITLE)
  },
  getSubmissionButton() {
    return cy.get('button').should('have.text', '＋ New submission')
  },
  clickSubmissionButton() {
    return this.getSubmitButton().click()
  },
  getSectionPlaceholder(nth) {
    return cy.getByContainsClass(SECTION_PLACEHOLDER).eq(nth)
  },
  getCreateNewVersionButton() {
    return cy.getByDataTestId(CREATE_NEW_VERSION_BUTTON)
  },
  clickCreateNewVersionButton() {
    this.getCreateNewVersionButton().click()
  },
  getDecisionField(nth) {
    return cy.get(DECISION_FIELDS).eq(nth)
  },
  getControlButton() {
    return cy.getByDataTestId(CONTROL_BUTTON)
  },
  clickControl() {
    this.getControlButton().click()
  },
  getManuscriptNavButton() {
    return cy.get(MANUSCRIPT_NAV_BUTTON)
  },
  clickManuscriptNavButton() {
    this.getManuscriptNavButton().click()
  },
  getInvitedReviewersButton() {
    return cy.getByDataTestId(INVITED_REVIEWS_STATUS)
  },
  clickInvitedReviewers() {
    this.getInvitedReviewersButton().click()
  },
  getAcceptReviewButton() {
    return cy.getByDataTestId(ACCEPT_REVIEW_BUTTON)
  },
  clickAcceptReviewButton() {
    this.getAcceptReviewButton().click({ force: true })
    // cy.reload()
  },
  getRejectReviewButton() {
    return cy.getByDataTestId(REJECT_REVIEW_BUTTON)
  },
  clickRejectReviewButton() {
    this.getRejectReviewButton().click({ force: true })
    cy.reload()
  },
  getDoReviewButton() {
    return cy.get(DO_REVIEW_BUTTON)
  },
  clickDoReview() {
    this.getDoReviewButton().click({ force: true })
  },
  clickDoReviewAndVerifyPageLoaded() {
    this.getDoReviewButton().click()
    cy.awaitDisappearSpinner()
    cy.url({ timeout: 10000 }).should('contain', 'review')
  },
  getInvitedReviewsStatus() {
    return cy.getByDataTestId(INVITED_REVIEWS_STATUS)
  },
  getAcceptedReviewStatus() {
    return cy.getByDataTestId(ACCEPTED_REVIEWS_STATUS)
  },
  getRejectedReviewsStatus() {
    return cy.getByDataTestId(REJECTED_REVIEWS_STATUS)
  },
  getCompletedReviewsStatus() {
    return cy.getByDataTestId(COMPLETED_REVIEWS_STATUS)
  },
  getVersionTitle() {
    return cy.getByContainsClass(VERSION_TITLE)
  },
  getCompletedReviewButton() {
    return cy.get(ARTICLE_LINK)
  },
  clickCompletedReviewButton() {
    this.getCompletedReviewButton().click({ force: true })
  },
  getDashboardTab() {
    return cy.get(DASHBOARD_TAB)
  },
  clickDashboardTab(nth) {
    this.getDashboardTab().eq(nth).click()
  },
}
