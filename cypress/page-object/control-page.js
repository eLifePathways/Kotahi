/// <reference types="Cypress" />
/**
 * Page object representing the Control page,
 * which can be accessed either through the Dashboard page
 * ('Manuscripts I'm editor of' section)
 * or through the Manuscripts page.
 */

// Emai Notifications
const NOTIFY_BUTTON = '[data-testid="email-notification-row"] > button'
const EMAIL_NOTIFICATION_LOG_MESSAGE = 'email-log-message'
const EMAIL_NOTIFICATION_SECTION = 'email-notification-row'
const NEW_USER_CHECKBOX = '[data-testid="email-notification-row"] > label'
const NEW_USER_EMAIL_FIELD = '[placeholder="Email"]'
const NEW_USER_NAME_FIELD = '[placeholder="Name"]'
const EMAIL_NOTIFICATION_DROPDOWNS =
  '[data-testid="email-notification-row"] > div'

const ASSIGN_SENIOR_EDITOR = 'assign-seniorEditor'
const ASSIGN_HANDLING_EDITOR = 'assign-handlingEditor'
const ASSIGN_MANUSCRIPT_EDITOR = 'assign-editor'

// Reviews + Invitations
const INVITE_REVIEWER_SELECT = 'invite-reviewer-select'
const INVITE_REVIEWER_SUBMIT_BUTTON = 'invite-reviewer'
const INVITED_REVIEWERS = '[data-testid="kanban-card"]'
const INVITE_REVIEWER_SUBMIT_MODAL_BUTTON = 'submit-modal'
const REVIEWER_MODAL_SHARED_CHECKBOX = 'input[type="checkbox"]:nth(10)'

// Decision + Publishing
const PUBLISH_BUTTON = '[data-testid="publish-button"]'
const PUBLISH_INFO_MESSAGE = 'General__SectionActionInfo-sc-1chiust-12'
const DECISION_FIELD = '[contenteditable="true"]'

// Review
const REVIEW_MESSAGE = '[data-testid="readonly-editor"]'
const REVIEW_OPTION_CHECKBOX =
  '[data-testid="review-option-checkbox"] > [type=checkbox]'
const REVIEWER_NAME = '[data-testid="reviewer-info"]'
const NO_REVIEWS_MESSAGE = '[data-testid="section-row"]'
const ACCEPTED_TO_PUBLISH_REVIEW_ICON =
  '[data-testid="decision-review-name"] img'

// Chat
const MESSAGE_CONTAINER = '[data-testid="chat-panel"]'
const CHAT_TAB = '[data-testid="chat-panel"] [data-testid=tab-container]'
const EXPAND_CHAT_BUTTON = '[data-testid="expand-chat"]'

// Multiple Elements
const SUBMIT_BUTTON = 'decision-action-btn' // Also Matches Notify Button

const DROPDOWN_OPTION = '[data-testid="select-option"]'
const METADATA_TAB = 'tab-container'
const METADATA_CELL = 'version-title'
const ERROR_TEXT = 'form-error-text'
const FORM_STATUS = 'form-status'
const SHOW_BUTTON = '[data-testid="decision-review-controls"]>[type*=button]'

// Decision Form
const DECISION_TEXT_INPUT = 'comment'
//  ':nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1) > .EditorStyles__SimpleGrid-k4rcxo-9 > .EditorStyles__SimpleEditorDiv-k4rcxo-11'

const DECISION_RADIO_BUTTON = '[data-testid="safe-radio-group"]'
const DECISION_SUBMIT_BUTTON = 'decision-action-btn'
const DECISION_FILE_INPUT = 'input[type=file]'

const CHECK_SVG = 'check-svg'

export const ControlPage = {
  getInviteReviewerDropdown() {
    return cy.getByDataTestId(INVITE_REVIEWER_SELECT)
  },
  openInviteReviewerDropdown() {
    this.getInviteReviewerDropdown()
      .closest('.react-select__control')
      .click({ force: true })
    this.getInviteReviewerDropdown().find('input').should('exist')
  },
  clickInviteReviewerDropdown() {
    this.openInviteReviewerDropdown()
  },
  inviteReviewer(name) {
    this.openInviteReviewerDropdown()
    this.selectReviewerNamed(name)
    this.clickInviteReviewerSubmit()
    this.clickReviewerSubmitModalButton()
  },
  getInviteReviewerSubmitButton() {
    return cy.getByDataTestId(INVITE_REVIEWER_SUBMIT_BUTTON)
  },
  clickInviteReviewerSubmit() {
    this.getInviteReviewerSubmitButton().click()
  },
  selectReviewerNamed(name) {
    this.getInviteReviewerDropdown()
      .find('input')
      .type(`{selectall}${name}`, { delay: 50, force: true })
    cy.get('.react-select__menu', { timeout: 10000 })
      .should('be.visible')
      .contains('.react-select__option', name)
      .click({ force: true })
  },
  getInvitedReviewersList() {
    return cy.get(INVITED_REVIEWERS)
  },
  getNumberOfInvitedReviewers() {
    return this.getInvitedReviewersList().its('length')
  },
  getDecisionField(nth) {
    return cy.get(DECISION_FIELD).eq(nth)
  },
  fillInDecision(decision) {
    this.getDecisionTextInput().click()
    this.getDecisionTextInput().type(decision, { force: true })
  },
  getPublishButton() {
    return cy.get(PUBLISH_BUTTON)
  },
  clickPublish() {
    this.getPublishButton().click()
  },
  getPublishInfoMessage() {
    return cy.getByContainsClass(PUBLISH_INFO_MESSAGE).invoke('text')
  },
  getAssignSeniorEditorDropdown() {
    return cy.getByDataTestId(ASSIGN_SENIOR_EDITOR)
  },
  clickAssignSeniorEditorDropdown() {
    this.getAssignSeniorEditorDropdown().click({ force: true })
  },
  getAssignHandlingEditorDropdown() {
    return cy.getByDataTestId(ASSIGN_HANDLING_EDITOR)
  },
  clickAssignHandlingEditorDropdown() {
    this.getAssignHandlingEditorDropdown().click({ force: true })
  },
  getAssignEditorDropdown() {
    return cy.getByDataTestId(ASSIGN_MANUSCRIPT_EDITOR)
  },
  clickAssignEditorDropdown() {
    this.getAssignEditorDropdown().click({ force: true })
  },
  selectDropdownOptionByName(name) {
    cy.get(DROPDOWN_OPTION, { timeout: 10000 })
      .should('be.visible')
      .contains(name)
      .click({ force: true })
  },
  waitForAssignEditorValue(testId, name) {
    cy.get(`[data-testid="${testId}"]`, { timeout: 20000 }).should(
      'contain',
      name,
    )
    cy.awaitDisappearSpinner()
  },
  assignSeniorEditor(name) {
    this.clickAssignSeniorEditorDropdown()
    this.selectDropdownOptionByName(name)
    this.waitForAssignEditorValue(ASSIGN_SENIOR_EDITOR, name)
  },
  assignHandlingEditor(name) {
    this.clickAssignHandlingEditorDropdown()
    this.selectDropdownOptionByName(name)
    this.waitForAssignEditorValue(ASSIGN_HANDLING_EDITOR, name)
  },
  assignManuscriptEditor(name) {
    this.clickAssignEditorDropdown()
    this.selectDropdownOptionByName(name)
    this.waitForAssignEditorValue(ASSIGN_MANUSCRIPT_EDITOR, name)
  },

  getMetadataCell() {
    return cy.get(`[data-testid="${METADATA_CELL}"]`)
  },

  getErrorText() {
    return cy.get(`[data-testid="${ERROR_TEXT}"]`)
  },

  getDecisionRadioGroup() {
    return cy.get(DECISION_RADIO_BUTTON).scrollIntoView()
  },
  getAcceptRadioButton() {
    return this.getDecisionRadioGroup().find('input[value="accept"]')
  },
  clickAccept() {
    this.getAcceptRadioButton().click({ force: true })
  },
  getReviseRadioButton() {
    return this.getDecisionRadioGroup().find('input[value="revise"]')
  },
  clickRevise() {
    this.getReviseRadioButton().click({ force: true })
  },
  getRejectRadioButton() {
    return this.getDecisionRadioGroup().find('input[value="reject"]')
  },
  clickReject() {
    this.getRejectRadioButton().click({ force: true })
  },
  getSubmitButton() {
    return cy.getByDataTestId(SUBMIT_BUTTON)
  },
  clickSubmit() {
    this.getSubmitButton().click()
  },
  getFormStatus() {
    return cy.get(`[data-testid="${FORM_STATUS}"]`)
  },
  getShowButton() {
    return cy.get(SHOW_BUTTON)
  },
  clickShow() {
    this.getShowButton().click()
  },
  getReviewMessage() {
    return cy.get(REVIEW_MESSAGE)
  },
  getHideReviewToAuthorCheckbox() {
    return cy.get(REVIEW_OPTION_CHECKBOX).eq(0)
  },
  clickHideReviewToAuthor() {
    this.getHideReviewToAuthorCheckbox().click()

    // cy.wait(2000)
    // cy.getHideReviewToAuthorCheckbox('should', 'not.be.checked')
  },
  getHideReviewerNameCheckbox() {
    return cy.get(REVIEW_OPTION_CHECKBOX).eq(1)
  },
  clickHideReviewerNameToAuthor() {
    this.getHideReviewerNameCheckbox().click()

    // cy.wait(2000)
  },
  getReviewerSubmitModalButton() {
    return cy.getByDataTestId(INVITE_REVIEWER_SUBMIT_MODAL_BUTTON)
  },
  clickReviewerSubmitModalButton() {
    return this.getReviewerSubmitModalButton().click()
  },
  getReviewerSharedCheckbox() {
    return cy.get(REVIEWER_MODAL_SHARED_CHECKBOX)
  },
  clickReviewerSharedCheckbox(nth) {
    return this.getReviewerSharedCheckbox()
      .eq(nth || 0)
      .click()
  },
  getInvitedReviewer() {
    return cy.get(INVITED_REVIEWERS)
  },
  clickInvitedReviewer() {
    return this.getInvitedReviewer().click()
  },
  getReviewerName() {
    return cy.get(REVIEWER_NAME)
  },
  waitThreeSec() {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000)
  },
  getNoReviewsMessage() {
    return cy.get(NO_REVIEWS_MESSAGE)
  },
  getAcceptedToPublishReview() {
    return cy.get(ACCEPTED_TO_PUBLISH_REVIEW_ICON)
  },
  checkEditDateIsUpdated() {
    const getTodayDate = () => {
      const date = new Date()
      const year = date.getFullYear()
      let month = date.getMonth() + 1
      const day = date.getDate()

      if (month <= 9) {
        month = `0${month}`
      }

      return `${year}-${month}-${day}`
    }

    this.getMetadataCell(13).should('contain', getTodayDate())
  },
  getEmailNotificationSection() {
    return cy.get(`[data-testid="${EMAIL_NOTIFICATION_SECTION}"]`)
  },
  getNewUserCheckbox() {
    return cy.get(NEW_USER_CHECKBOX)
  },
  clickNewUser() {
    this.getNewUserCheckbox().click()
  },
  getNewUserEmailField() {
    return cy.get(NEW_USER_EMAIL_FIELD)
  },
  fillInNewUserEmail(email) {
    this.getNewUserEmailField().fillInput(email)
  },
  getNewUserNameField() {
    return cy.get(NEW_USER_NAME_FIELD)
  },
  fillInNewUserName(name) {
    this.getNewUserNameField().fillInput(name)
  },
  getEmailNotificationDropdowns() {
    return cy.get(EMAIL_NOTIFICATION_DROPDOWNS)
  },
  clickEmailNotificationNthDropdown(nth) {
    this.getEmailNotificationDropdowns().eq(nth).click({ force: true })
  },
  getNotifyButton() {
    return cy.get(NOTIFY_BUTTON)
  },
  clickNotify() {
    this.getNotifyButton().click()
  },
  getMessageContainer() {
    return cy.get(MESSAGE_CONTAINER)
  },
  getExpandChatButton() {
    return cy.get(EXPAND_CHAT_BUTTON)
  },
  clickExpandChatButton() {
    this.getExpandChatButton().click()
  },
  getChatTab() {
    return cy.get(CHAT_TAB)
  },
  clickNthChatTab(nth) {
    this.getChatTab().eq(nth).click()
  },
  getLogMessage() {
    return cy.get(`[data-testid="${EMAIL_NOTIFICATION_LOG_MESSAGE}"]`)
  },
  getMetadataTab(nth) {
    return cy.getByDataTestId(METADATA_TAB).eq(nth)
  },
  getWorkflowTab() {
    return cy.getByDataTestId('tab-container').contains('Workflow')
  },
  getControlPageTabs() {
    return cy.getByDataTestId('tab-container')
  },
  clickDecisionTab() {
    cy.getByDataTestId('tab-container')
      .contains('Decision')
      .click({ force: true })
  },
  clickReviewsTab() {
    cy.getByDataTestId('tab-container')
      .contains('Reviews')
      .click({ force: true })
  },
  // Decision Form
  getDecisionTextInput() {
    return cy
      .getByDataTestId(DECISION_TEXT_INPUT)
      .find('[contenteditable]')
      .first()
  },
  clickDecisionTextInput() {
    return this.getDecisionTextInput().click()
  },
  getDecisionFileInput() {
    return cy.get(DECISION_FILE_INPUT)
    // eslint-disable-next-line cypress/no-unnecessary-waiting, no-unreachable
    cy.wait(3000)
  },
  getSubmitDecisionButton() {
    return cy.getByDataTestId(DECISION_SUBMIT_BUTTON).scrollIntoView()
  },
  clickSubmitDecisionButton() {
    this.getSubmitDecisionButton().click()
  },
  getCheckSvg() {
    return cy.getByDataTestId(CHECK_SVG)
  },
  checkSvgExists() {
    cy.get('[data-testid="check-svg"]', { timeout: 10000 }).should('exist')
  },
}
