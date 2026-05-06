/// <reference types="Cypress" />
/**
 * Page object representing the Control page,
 * which can be accessed either through the Dashboard page
 * ('Manuscripts I'm editor of' section)
 * or through the Manuscripts page.
 */

// Emai Notifications
const NOTIFY_BUTTON = '[class*=emailNotifications__RowGridStyled] > button'
const EMAIL_NOTIFICATION_LOG_MESSAGE = 'style__InnerMessageContainer'
const EMAIL_NOTIFICATION_SECTION = 'emailNotifications__RowGridStyled'
const NEW_USER_CHECKBOX = '[class*=emailNotifications__RowGridStyled] > label'
const NEW_USER_EMAIL_FIELD = '[placeholder="Email"]'
const NEW_USER_NAME_FIELD = '[placeholder="Name"]'
const EMAIL_NOTIFICATION_DROPDOWNS =
  '[class*=emailNotifications__RowGridStyled] > div'

const ASSIGN_SENIOR_EDITOR_DROPDOWN = 'Assign seniorEditor'
const ASSIGN_HANDLING_EDITOR_DROPDOWN = 'Assign handlingEditor'
const ASSIGN_EDITOR_DROPDOWN = 'Assign editor'

// Reviews + Invitations
const INVITE_REVIEWER_DROPDOWN = 'Invite reviewers'
const INVITE_REVIEWER_OPTION_LIST = 'react-select'
const INVITE_REVIEWER_SUBMIT_BUTTON = 'invite-reviewer'
const INVITED_REVIEWERS = '[class*=KanbanCard__Card]'
const INVITE_REVIEWER_SUBMIT_MODAL_BUTTON = 'submit-modal'
const REVIEWER_MODAL_SHARED_CHECKBOX = 'input[type="checkbox"]:nth(10)'

// Decision + Publishing
const PUBLISH_BUTTON =
  '.General__SectionAction-sc-1chiust-11 > .Publish__ActionButtonsWrapper-sc-1pyb416-0 > .Button__StyledButton-sc-qdm33h-0'
// '[class*=General__SectionAction-sc-1chiust-11] > .sc-bkzZxe'
const PUBLISH_INFO_MESSAGE = 'General__SectionActionInfo-sc-1chiust-12'
const DECISION_FIELD = '[contenteditable="true"]'

// Review
const REVIEW_MESSAGE = '[class*=EditorStyles__ReadOnlySimpleEditorDiv]'
const REVIEW_OPTION_CHECKBOX =
  '[class*=ReviewHeading__StyledCheckbox] > [type=checkbox]'
const REVIEWER_NAME = '[class*=Review__Heading]'
const NO_REVIEWS_MESSAGE = '[class*=General__SectionRow]'
const ACCEPTED_TO_PUBLISH_REVIEW_ICON = '[class*=DecisionReview__Name] img'

// Chat
const MESSAGE_CONTAINER = '.General__Chat-sc-1chiust-18'
const CHAT_TAB = '[class*=General__Chat] [data-test-id=tab-container]'
const EXPAND_CHAT_BUTTON = '[class*=style__ChatButton]'

// Multiple Elements
const SUBMIT_BUTTON = 'decision-action-btn' // Also Matches Notify Button

const DROPDOWN_OPTION = '[class*=react-select__option]'
const METADATA_TAB = 'HiddenTabs__TabContainer-sc-11z25w4-2'
const METADATA_CELL = 'VersionSwitcher__Title'
const ERROR_TEXT = 'style__ErrorText-'
const FORM_STATUS = 'style__FormStatus-'
const SHOW_BUTTON = '[class*=DecisionReview__Controls]>[type*=button]'

// Decision Form
const DECISION_TEXT_INPUT = 'comment'
//  ':nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1) > .EditorStyles__SimpleGrid-k4rcxo-9 > .EditorStyles__SimpleEditorDiv-k4rcxo-11'

const DECISION_RADIO_BUTTON = '[class*=FormTemplate__SafeRadioGroup]'
const DECISION_SUBMIT_BUTTON = 'decision-action-btn'
const DECISION_FILE_INPUT = 'input[type=file]'

const CHECK_SVG = 'check-svg'

export const ControlPage = {
  getInviteReviewerDropdown() {
    return cy.getByContainsAriaLabel(INVITE_REVIEWER_DROPDOWN)
  },
  clickInviteReviewerDropdown() {
    this.getInviteReviewerDropdown().click({ force: true })
  },
  inviteReviewer(name) {
    this.clickInviteReviewerDropdown()
    this.selectReviewerNamed(name)
    this.clickInviteReviewerSubmit()
    this.clickReviewerSubmitModalButton()

    // cy.wait(1000)
  },
  getInviteReviewerOptionList() {
    return cy.getByContainsId(INVITE_REVIEWER_OPTION_LIST)
  },
  getInviteReviewerSubmitButton() {
    return cy.getByDataTestId(INVITE_REVIEWER_SUBMIT_BUTTON)
  },
  clickInviteReviewerSubmit() {
    this.getInviteReviewerSubmitButton().click()
  },
  selectReviewerNamed(uuid) {
    this.getInviteReviewerOptionList().contains(uuid).click()
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
    this.getDecisionField(0).fillInput(decision)
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
    return cy.getByContainsAriaLabel(ASSIGN_SENIOR_EDITOR_DROPDOWN)
  },
  clickAssignSeniorEditorDropdown() {
    this.getAssignSeniorEditorDropdown().click({ force: true })
  },
  getAssignHandlingEditorDropdown() {
    return cy.getByContainsAriaLabel(ASSIGN_HANDLING_EDITOR_DROPDOWN)
  },
  clickAssignHandlingEditorDropdown() {
    this.getAssignHandlingEditorDropdown().click({ force: true })
  },
  getAssignEditorDropdown() {
    return cy.getByContainsAriaLabel(ASSIGN_EDITOR_DROPDOWN)
  },
  clickAssignEditorDropdown() {
    this.getAssignEditorDropdown().click({ force: true })
  },
  selectDropdownOptionByName(name) {
    cy.get(DROPDOWN_OPTION).contains(name).click({ force: true })
  },

  getMetadataCell() {
    return cy.getByContainsClass(METADATA_CELL)
  },

  getErrorText() {
    return cy.getByContainsClass(ERROR_TEXT)
  },

  getAcceptRadioButton() {
    return cy.get(DECISION_RADIO_BUTTON).eq(0)
  },
  clickAccept() {
    this.getAcceptRadioButton().click()
  },
  getReviseRadioButton() {
    return cy.get(DECISION_RADIO_BUTTON).eq(1)
  },
  clickRevise() {
    this.getReviseRadioButton().click()
  },
  getRejectRadioButton() {
    return cy.get(DECISION_RADIO_BUTTON).eq(2)
  },
  clickReject() {
    this.getRejectRadioButton().click()
  },
  getSubmitButton() {
    return cy.getByDataTestId(SUBMIT_BUTTON)
  },
  clickSubmit() {
    this.getSubmitButton().click()
  },
  getFormStatus() {
    return cy.getByContainsClass(FORM_STATUS)
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
    return cy.getByContainsClass(EMAIL_NOTIFICATION_SECTION)
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
    return cy.getByContainsClass(EMAIL_NOTIFICATION_LOG_MESSAGE)
  },
  getMetadataTab(nth) {
    return cy.getByContainsClass(METADATA_TAB).eq(nth)
  },
  getWorkflowTab() {
    return cy.get('[data-test-id=tab-container]').contains('Workflow')
  },
  getControlPageTabs() {
    return cy.get('[data-test-id=tab-container]')
  },
  clickDecisionTab() {
    this.getControlPageTabs().contains('Decision').click()
  },
  clickReviewsTab() {
    this.getControlPageTabs().contains('Reviews').click()
  },
  // Decision Form
  getDecisionTextInput() {
    return cy.getByDataTestId(DECISION_TEXT_INPUT)
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
    return cy.getByDataTestId(DECISION_SUBMIT_BUTTON)
  },
  clickSubmitDecisionButton() {
    this.getSubmitDecisionButton().click()
  },
  getCheckSvg() {
    return cy.getByDataTestId(CHECK_SVG)
  },
  checkSvgExists() {
    this.getCheckSvg().should('exist')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
  },
}
