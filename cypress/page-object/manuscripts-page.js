/// <reference types="Cypress" />
import { evaluate } from '../support/routes'
// import { ControlPage } from './control-page'

/**
 * Page component representing the fourth option in the left side menu,
 * where users can see the list of submitted manuscripts & select Control,
 * View or Delete.
 */

const BUTTON = 'button'
const EXPAND_CHAT_BUTTON = '[data-testid=round-icon-button-wrapper]'
const EVALUATION_BUTTON = '[href*=evaluation]'
// const CONTROL_BUTTON = '[href*="/kotahi/versions/"]'
const CREATED_CARET = 'Carets__Caret'
const TABLE_HEADER = '[class*=Table__Header]'
const ARTICLE_TITLE = '[class*=Table__Row]>td:nth-child(1)'
const ARTICLE_ID = '[data-testid="submission.articleId"]'
const ARTICLE_LABEL =
  '[data-testid="submission.$customStatus"] [data-testid="editable-option-select"]'
const ARTICLE_TOPIC = '[class*=Table__Cell] > [title]'
const TABLE_ROW = '.ant-table-tbody .ant-table-row'
const TABLE_CELL = 'Table__Cell'

const ARTICLE_CHECKBOX = '.ant-table-tbody .ant-checkbox-wrapper'
const SELECT_ALL_CHECKBOX = '.ant-table-thead .ant-checkbox-wrapper'
const EDITOR_NAME_CELL = 'style__StyledAuthor'
const ARTICLES_COUNT = '.ant-pagination-total-text strong'
const PAGINATION_PAGE_BUTTON = 'Page '

const CONFIRMATION_MESSAGE = '.ant-modal-confirm-content'

const IMPORT_CONFIRMATION_POPUP = '[class*=Toastify] > [role=alert]'
// const CONTROL = '[href*=decision]'
const DROPDOWN_OPTION = '[data-testid="select-option"]'

export const ManuscriptsPage = {
  getEvaluationLink() {
    return cy.getByDataTestId('evaluation-action-link').first()
  },
  clickEvaluationLink() {
    this.getEvaluationLink().click()
  },
  getControlLink() {
    return cy.getByDataTestId('control-action-link')
  },
  clickControlLink() {
    this.getControlLink().click()
  },
  getViewLink() {
    return cy.getByDataTestId('view-action-link')
  },
  clickViewLink() {
    this.getViewLink().click()
  },
  getProductionLink() {
    return cy.getByDataTestId('production-action-link')
  },
  clickProductionLink() {
    this.getProductionLink().click()
  },
  getPublishLink() {
    return cy.getByDataTestId('publish-action-link')
  },
  clickPublishLink() {
    this.getPublishLink().click()
  },
  getSubmitButton() {
    return cy.get(BUTTON).contains('New submission')
  },
  clickSubmit() {
    this.getSubmitButton().scrollIntoView().click()
  },
  getRefreshButton() {
    return cy.contains('Refresh')
  },
  clickRefreshButton() {
    this.getRefreshButton().click()
  },
  getExpandChatButton() {
    return cy.get(EXPAND_CHAT_BUTTON)
  },
  clickExpandChatButton() {
    this.getExpandChatButton().click()
  },
  getManuscriptsPageTitle() {
    return cy.get('h1')
  },
  getEvaluationButton() {
    return this.getEvaluationLink()
  },
  getNthEvaluationButton(nth) {
    return cy.get(EVALUATION_BUTTON).eq(nth)
  },
  clickEvaluation() {
    this.getEvaluationButton().click()
  },
  clickEvaluationAndVerifyUrl() {
    this.clickEvaluation()
    cy.url({ timeout: 10000 }).should('contain', evaluate)
  },
  clickEvaluationNth(nth) {
    this.getNthEvaluationButton(nth).click()
  },
  clickEvaluationNthAndVerifyUrl(nth) {
    this.clickEvaluationNth(nth)
    cy.awaitDisappearSpinner()
    cy.url({ timeout: 10000 }).should('contain', evaluate)
  },
  // getControlButton() {
  //   return cy.get(CONTROL_BUTTON).first()
  // },
  // clickControlButton() {
  //   this.getControlButton().click()
  // },
  // getControl() {
  //   return cy.get(CONTROL)
  // },
  // clickControl() {
  //   this.getControl().click()
  // },
  // clickControlAndVerifyPageLoaded() {
  //   this.getControl().click()
  //   cy.awaitDisappearSpinner()
  //   cy.url({ timeout: 10000 }).should('contain', 'decision')
  //   ControlPage.getAssignSeniorEditorDropdown().should('be.visible')
  // },
  // clickControlNthAndVerifyPageLoaded(nth) {
  //   this.getControl().eq(nth).click()
  //   cy.awaitDisappearSpinner()
  //   cy.url({ timeout: 10000 }).should('contain', 'decision')
  //   ControlPage.getAssignSeniorEditorDropdown().should('be.visible')
  // },
  getCreatedCaret(nth) {
    return cy.getByContainsClass(CREATED_CARET).eq(nth)
  },
  getAuthorField(nth) {
    return cy.getByDataTestId('person-name').eq(nth)
  },
  getAuthor(nth) {
    return this.getAuthorField(nth).invoke('text')
  },
  getStatusField(nth) {
    return cy.getByDataTestId('badge-status').eq(nth)
  },
  getStatus(nth) {
    return this.getStatusField(nth).invoke('text')
  },
  getTableHead() {
    return cy.get('.ant-table-thead')
  },
  getArticleTitleByRow(nth) {
    return cy.get(ARTICLE_TITLE).eq(nth)
  },
  getArticleIdByRow(nth) {
    return cy.get(ARTICLE_ID).eq(nth)
  },
  clickArticleId() {
    return this.getArticleIdByRow(0).scrollIntoView().click()
  },
  filterColumnByValue(columnKey, valueLabel) {
    cy.get(`.ant-table-thead [data-testid="${columnKey}"]`)
      .find('.ant-table-filter-trigger')
      .click()
    cy.get('.ant-table-filter-dropdown').contains(valueLabel).click()
    cy.get('.ant-table-filter-dropdown').contains('button', 'OK').click()
  },
  selectCustomStatus(statusLabel) {
    this.filterColumnByValue('submission.$customStatus', statusLabel)
  },
  getArticleLabel() {
    return cy.get(ARTICLE_LABEL)
  },
  clickArticleLabel(nth) {
    this.getArticleLabel().eq(nth).click()
  },
  clickArticleLabelClear(nth) {
    this.getArticleLabel()
      .eq(nth)
      .find('.ant-select-clear')
      .click({ force: true })
  },
  getAllArticleTopics() {
    return cy.get(ARTICLE_TOPIC)
  },
  getArticleTopic(nth) {
    return this.getAllArticleTopics().eq(nth)
  },
  getArticleTopicWithText(text) {
    return this.getAllArticleTopics().contains(text)
  },
  getArticleTopicByRow(nth) {
    return this.getNthTableRow(nth).find(ARTICLE_TOPIC)
  },
  clickArticleTopic(nth) {
    this.getArticleTopic(nth).click()
  },
  clickArticleTopicWithText(text) {
    this.getArticleTopicWithText(text).click()
  },
  getTableRow() {
    return cy.get(TABLE_ROW)
  },
  getNthTableRow(nth) {
    return this.getTableRow().eq(nth)
  },
  getTableRowsCount() {
    return cy.get(TABLE_ROW).its('length')
  },
  assertNoTableRows() {
    return cy.get(TABLE_ROW).should('not.exist')
  },
  getManuscriptRowsCount() {
    return cy
      .get(
        '[class*="ManuscriptsRow"]:not([data-testid=manuscripts-header-row])',
      )
      .its('length')
  },
  getTableJournal() {
    return cy.getByContainsClass(TABLE_CELL).eq(1)
  },
  getLabelRow(nth) {
    return cy.get(ARTICLE_LABEL).eq(nth)
  },
  getTableHeader() {
    return cy.get(TABLE_HEADER, { timeout: 15000 })
  },
  getAllArticleCheckboxes() {
    return cy.get(ARTICLE_CHECKBOX)
  },
  getArticleCheckbox(nth) {
    return this.getAllArticleCheckboxes().eq(nth)
  },
  clickArticleCheckbox(nth) {
    this.getArticleCheckbox(nth).click()
  },
  getAllArticleCheckboxesLength() {
    return this.getAllArticleCheckboxes().its('length')
  },
  getSelectAllCheckbox() {
    return cy.get(SELECT_ALL_CHECKBOX).eq(0)
  },
  getSelectedArticlesCount() {
    return cy.getByDataTestId('selected-manuscripts-number').invoke('text')
  },
  clickDelete() {
    cy.contains('button', /^Archive$/).click()
  },
  getConfirmButton() {
    return cy.contains('button', 'OK')
  },
  clickConfirm() {
    this.getConfirmButton().should('be.visible').click()
  },
  getConfirmationMessageForBulkDelete() {
    return cy.get(CONFIRMATION_MESSAGE)
  },
  getCloseButton() {
    return cy.contains('button', 'Cancel')
  },
  clickClose() {
    this.getCloseButton().should('be.visible').click()
  },
  getEditorName() {
    return cy.getByContainsClass(EDITOR_NAME_CELL)
  },
  getTooltipIcon() {
    return cy.getByDataTestId('abstract-tooltip-icon')
  },
  getTooltipText() {
    return cy.getByDataTestId('abstract-tooltip')
  },
  getNumberOfAvailableArticles() {
    return cy.get(ARTICLES_COUNT).eq(-1)
  },
  getPaginationButton(nth) {
    return cy.getByContainsAriaLabel(`${PAGINATION_PAGE_BUTTON}${nth}`)
  },
  clickPaginationButton(nth) {
    this.getPaginationButton(nth).click({ force: true })
  },
  getSuccessfulImportPopup() {
    return cy.get(IMPORT_CONFIRMATION_POPUP, { timeout: 600000 })
  },
  selectDropdownOption(nth) {
    return cy.get(DROPDOWN_OPTION).eq(nth).click()
  },
  selectDropdownOptionWithText(text) {
    return cy.get(DROPDOWN_OPTION).contains(text).click({ force: true })
  },
}
export default ManuscriptsPage
