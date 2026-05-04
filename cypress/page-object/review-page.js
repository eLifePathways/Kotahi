/// <reference types="Cypress" />
/**
 * Page object representing the article review page,
 * where reviewers can leave comments, approve or reject the article.
 */
const REVIEW_METADATA_CELL = 'ReviewMetadata__Cell'

const ABSTRACT_EDITOR_FIELD = '.ProseMirror > .paragraph'

// const REVIEW_COMMENT_FIELD = 'reviewComment'
// const CONFIDENTIAL_COMMENT_FIELD = 'confidentialComment'
const ACCEPT_RADIO_BUTTON = '[value="accept"]'
const REVISE_RADIO_BUTTON = '[value="revise"]'
const REJECT_RADIO_BUTTON = '[value="reject"]'
const SUBMIT_BUTTON = 'review-action-btn'
const CONFIRM_SUBMIT_BUTTON = 'article > button:eq(0)'
// const DECISION_COMMENT_FIELD = 'decisionComment'
const ERROR_TEXT = 'style__ErrorText-'
const FORM_STATUS = 'style__FormStatus-'
const PUBLISH_BUTTON = 'button[type="button"]'
const CAN_BE_PUBLISHED_PUBLICLY_CHECKBOX = '[name=canBePublishedPublicly]'
const PAGE_SECTIONS = 'General__SectionContent'
const SECTION_HEADER = 'h2[class]'
const DECISION_TEXT = '[class*=EditorStyles__ReadOnlySimpleEditorDiv]'
const DECISION_RECOMMENDATION = 'style__Legend-sc-1jvxmxn-2 bTVTjY'

const DECISION_BUTTON_SELECTED =
  '[class*=component-decision-viewer__RadioGroup] [checked]'

export const ReviewPage = {
  getReviewMetadataCell(nth) {
    return cy.getByContainsClass(REVIEW_METADATA_CELL).eq(nth)
  },
  getReviewCommentField() {
    return cy.get('[contenteditable="true"]:nth(0)')
  },
  fillInReviewComment(reviewComment) {
    this.getReviewCommentField()
      .focus()
      .type(reviewComment, { delay: 200, force: true })
  },
  getConfidentialCommentField() {
    return cy.get('[contenteditable="true"]:nth(1)')
  },
  fillInConfidentialComment(confidentialComment) {
    this.getConfidentialCommentField().fillInput(confidentialComment)
  },
  getAcceptRadioButton() {
    return cy.get(ACCEPT_RADIO_BUTTON)
  },
  clickAcceptRadioButton() {
    this.getAcceptRadioButton().eq(0).click({ force: true })
  },
  getReviseRadioButton() {
    return cy.get(REVISE_RADIO_BUTTON)
  },
  clickReviseRadioButton() {
    this.getReviseRadioButton().eq(0).click({ force: true })
  },
  getRejectRadioButton() {
    return cy.get(REJECT_RADIO_BUTTON)
  },
  clickRejectRadioButton() {
    this.getRejectRadioButton().eq(0).click({ force: true })
  },
  getReviseButton() {
    return cy.get(REVISE_RADIO_BUTTON)
  },
  clickRevise() {
    this.getReviseButton().click()
  },
  getSubmitButton() {
    return cy.getByDataTestId(SUBMIT_BUTTON)
  },
  clickSubmitButton() {
    this.getSubmitButton().click()
  },
  getDecisionCommentField() {
    return cy.get(ABSTRACT_EDITOR_FIELD)
  },
  clickDecisionCommandField() {
    this.getDecisionCommentField().click().focused().blur()
  },
  fillInDecisionComment(decisionComment) {
    this.getDecisionCommentField().fillInput(decisionComment)
  },
  getErrorText() {
    return cy.getByContainsClass(ERROR_TEXT)
  },
  getFormStatus() {
    return cy.getByContainsClass(FORM_STATUS)
  },
  getPublishButton() {
    return cy.get(PUBLISH_BUTTON)
  },
  clickPublish() {
    this.getSubmitButton().eq(1).click()
  },
  waitThreeSec() {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000)
  },
  getCanBePublishedPubliclyCheckbox() {
    return cy.get(CAN_BE_PUBLISHED_PUBLICLY_CHECKBOX)
  },
  clickCanBePublishedPublicly() {
    this.getCanBePublishedPubliclyCheckbox().click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000)
  },
  getAllPageSections() {
    return cy.getByContainsClass(PAGE_SECTIONS)
  },
  getAllSectionHeaders() {
    return cy.get(SECTION_HEADER)
  },
  getDecisionText() {
    return cy.get(DECISION_TEXT)
  },
  getDecisionRecommendation() {
    return cy.getByContainsClass(DECISION_RECOMMENDATION)
  },
  getDecisionSelectedButton() {
    return cy.get(DECISION_BUTTON_SELECTED)
  },
  getConfirmSubmitButton() {
    return cy.get(CONFIRM_SUBMIT_BUTTON)
  },
  clickConfirmSubmitButton() {
    this.getConfirmSubmitButton().click()
  },
}
