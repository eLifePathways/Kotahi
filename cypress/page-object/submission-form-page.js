/// <reference types="Cypress" />
import { ManuscriptsPage } from './manuscripts-page'
import { evaluate, submit } from '../support/routes'

/* eslint-disable cypress/unsafe-to-chain-command */

/**
 * Page object representing the form which has
 * to be completed to correctly submit a research paper.
 * It contains various input fields & dropdowns,
 * listed in the same order they appear on the page.
 */
const ADD_A_LINK_BUTTON = 'li > button'
const ENTER_URL_FIELD = 'submission.'
const TITLE_FIELD = 'submission.$title'
const NAME_FIELD = 'submission.name'
const ABSTRACT_FIELD = 'submission.$abstract'
const DOI_FIELD = 'submission.$doi'
const SOURCE_URI_FIELD = 'submission.$sourceUri'
// const OUR_TAKE = 'submission.ourTake'
const MAIN_FINDINGS = 'submission.mainFindings'
const STUDY_STRENGTHS = 'submission.studyStrengths'
const LIMITATIONS_FIELD = 'submission.limitations'
const DROPDOWN_OPTION_LIST = '[class*=react-select__option]'
const KEYWORDS_FIELD = 'submission.keywords'
const CUSTOM_STATUS_DROPDOWN = 'Labels'
const REFERENCES_FIELD = 'submission.references'
const SUBMIT_RESEARCH_BUTTON = 'research-object-submission-form-action-btn'
const ELIFE_SUBMIT_RESEARCH_BUTTON = 'elife-submission-form-action-btn'
const SUBMIT_YOUR_MANUSCRIPT_BUTTON = 'confirm-submit'
const VALIDATION_ERROR_MESSAGE = 'field-error-message'
const CONTENT_EDITABLE_VALUE = '[contenteditable="true"]'
const SUBMISSION_FORM_INPUT_BOX = 'ProseMirror'
const WORD_COUNT_INFO = 'Counter Info'
const EDITOR_CLASS = '.wax-surface-scroll >  div .ProseMirror'

// specific to journal
const TYPE_OF_RESEARCH_OBJECT = '.css-1f7humo-control'

// specific to preprint1
const FORM_OPTION_LIST = '[data-testid^="submission."]'
const FORM_OPTION_VALUE = 'singleValue'
const ARTICLE_ID_FIELD = 'submission.articleId'
const REVIEW_1_DATE_FEILD = 'submission.review1date'
const REVIEW_2_DATE_FEILD = 'submission.review2date'
const REVIEW_3_DATE_FEILD = 'submission.review3date'
const SUMMARY_DATE = 'submission.summarydate'
const REVIEW_1_CREATOR_FIELD = 'submission.review1creator'
const REVIEW_2_CREATOR_FIELD = 'submission.review2creator'
const REVIEW_3_CREATOR_FIELD = 'submission.review3creator'
const SUMMARY_CREATOR_FIELD = 'submission.summarycreator'
const SUBMISSION_REVIEW1 = '[data-testid="submission.review1"] .ProseMirror'
const SUBMISSION_REVIEW2 = '[data-testid="submission.review2"] .ProseMirror'
const SUBMISSION_REVIEW3 = '[data-testid="submission.review3"] .ProseMirror'
const SUBMISSION_SUMMARY = '[data-testid="submission.summary"] .ProseMirror'

// specific to preprint2
const FIRST_AUTHOR_FIELD = 'submission.firstAuthor'
const DATE_PUBLISHED_FIELD = 'submission.datePublished'
const JOURNAL_FIELD = 'submission.journal'
const REVIEWER_FIELD = 'submission.reviewer'
const EDIT_DATE_FIELD = 'submission.$editDate'
const REVIEW_CREATOR_FIELD = 'submission.reviewCreator'
// const DROPDOWN = '[class*=ValueContainer] > [class*=placeholder]'
const SUB_TOPICS_CHECKBOX_LIST = 'submission.subTopics'
const TOPICS_CHECKBOX_LIST = 'submission.topics'
const ASSIGN_EDITORS_DROPDOWN = '[class*=General__SectionRow] > [class]'

export const SubmissionFormPage = {
  getPageTitle() {
    return cy.get('h1').first()
  },
  getAddLinkButton() {
    return cy.get(ADD_A_LINK_BUTTON)
  },
  clickAddLink() {
    this.getAddLinkButton().click()
  },
  fillInField(dataTestId, text, shouldClearExisting = false) {
    const selector = `[data-testid="${dataTestId}"] input, select[data-testid="${dataTestId}"], textarea[data-testid="${dataTestId}"], [data-testid="${dataTestId}"] [contenteditable]`

    if (shouldClearExisting) {
      cy.get(selector)
        .scrollIntoView()
        .click({ force: true })
        .clear()
        .type(text)
    } else {
      cy.get(selector).scrollIntoView().click({ force: true }).type(text)
    }
  },
  checkBox(dataTestId, checkboxLabel) {
    cy.getByDataTestId(dataTestId)
      .contains(checkboxLabel)
      .scrollIntoView()
      .click()
  },
  getEnterUrlField(nth) {
    return cy.getByContainsName(ENTER_URL_FIELD).eq(nth)
  },
  fillInUrl(nth, url) {
    this.getEnterUrlField(nth).fillInput(url)
  },
  getTitleField() {
    return cy.getByDataTestId(TITLE_FIELD).find('input')
  },
  fillInTitle(title) {
    this.getTitleField().fillInput(title)
  },
  getNameField() {
    return cy.getByDataTestId(NAME_FIELD)
  },
  fillInName(name) {
    this.getNameField().fillInput(name)
  },
  getAbstractField() {
    return cy.getByContainsName(ABSTRACT_FIELD)
  },

  fillInAbstract(abstract) {
    this.getWaxInputBox(0).find(CONTENT_EDITABLE_VALUE).fillInput(abstract)
  },
  getWaxField(nth) {
    return cy.get(EDITOR_CLASS).eq(nth)
  },
  fillInOurTake(ourTake) {
    this.getWaxField(1).fillInput(ourTake)
  },
  getMainFindingsField() {
    return cy.getByContainsName(MAIN_FINDINGS)
  },
  fillInMainFindings(mainFindings) {
    this.getWaxField(2).fillInput(mainFindings)
  },
  getStudyStrengthsField() {
    return cy.getByContainsName(STUDY_STRENGTHS)
  },
  fillInStudyStrengths(studyStrengths) {
    this.getWaxField(3).fillInput(studyStrengths)
  },
  getLimitationsField() {
    return cy.getByContainsName(LIMITATIONS_FIELD)
  },
  fillInLimitations(limitations) {
    this.getWaxField(4).fillInput(limitations)
  },
  getCustomStatusDropdown() {
    return cy.getByContainsAriaLabel(CUSTOM_STATUS_DROPDOWN)
  },
  clickCustomStatusDropdown() {
    this.getCustomStatusDropdown().click({ force: true })
  },
  selectDropdownOption(nth) {
    return cy.get(DROPDOWN_OPTION_LIST).eq(nth).click()
  },
  getAllWaxInputBoxes() {
    return cy.getByClass(SUBMISSION_FORM_INPUT_BOX)
  },
  getWaxInputBox(nth) {
    return this.getAllWaxInputBoxes().eq(nth)
  },
  fillInCover(abstract) {
    this.getWaxInputBox(0).fillInput(abstract)
  },

  fillInDataCode(dataCode) {
    this.getWaxInputBox(1).find(CONTENT_EDITABLE_VALUE).fillInput(dataCode)
  },

  fillInEthicsField(ethics) {
    this.getWaxInputBox(2).find(CONTENT_EDITABLE_VALUE).fillInput(ethics)
  },

  getKeywordsField() {
    return cy.getByDataTestId(KEYWORDS_FIELD).find('input')
  },
  fillInKeywords(keywords) {
    this.getKeywordsField().fillInput(keywords)
  },
  getReferencesField() {
    return cy.getByDataTestId(REFERENCES_FIELD)
  },

  getSubmitResearchButton() {
    return cy.getByDataTestId(SUBMIT_RESEARCH_BUTTON)
  },
  clickSubmitResearch() {
    this.getSubmitResearchButton().scrollIntoView().click()
  },
  getElifeSubmitResearchButton() {
    return cy.getByDataTestId(ELIFE_SUBMIT_RESEARCH_BUTTON)
  },
  clickElifeSubmitResearch() {
    this.getElifeSubmitResearchButton().scrollIntoView().click()
  },
  clickSubmitResearchAndWaitPageLoad() {
    this.clickSubmitResearch()
    cy.url().should('not.contain', submit).and('not.contain', evaluate)
    cy.awaitDisappearSpinner()
    ManuscriptsPage.getTableHeader().should('be.visible')
  },
  clickSubmitResearchAndWaitPageLoadElife() {
    this.clickElifeSubmitResearch()
    cy.url().should('not.contain', submit).and('not.contain', evaluate)
    cy.awaitDisappearSpinner()
    ManuscriptsPage.getTableHead().should('be.visible')
  },
  getSubmitManuscriptButton() {
    return cy.getByDataTestId(SUBMIT_YOUR_MANUSCRIPT_BUTTON)
  },
  clickSubmitYourManuscript() {
    this.getSubmitManuscriptButton().click()
  },
  clickSubmitManuscriptAndWaitPageLoad() {
    this.clickSubmitYourManuscript()
    cy.url().should('not.contain', submit)
    cy.awaitDisappearSpinner()
  },
  getValidationErrorMessage(error) {
    return cy.getByDataTestId(VALIDATION_ERROR_MESSAGE).contains(error)
  },
  getValidationErrorMessage2() {
    return cy.getByDataTestId(VALIDATION_ERROR_MESSAGE)
  },
  getTypeOfResearchObject() {
    return cy.get(TYPE_OF_RESEARCH_OBJECT)
  },
  clickTypeOfResearchObject() {
    this.getTypeOfResearchObject().click()
  },
  getFormOptionValue(nth) {
    return cy.getByContainsClass(FORM_OPTION_VALUE).eq(nth)
  },
  getFormOptionList(nth) {
    return cy.get(FORM_OPTION_LIST).eq(nth)
  },
  clickElementFromFormOptionList(nth) {
    cy.get(FORM_OPTION_LIST).eq(nth).click()
  },
  getDropdownOption(nth) {
    return cy.get(DROPDOWN_OPTION_LIST).eq(nth)
  },
  getArticleId() {
    return cy.getByDataTestId(ARTICLE_ID_FIELD)
  },
  fillInArticleId(articleId) {
    this.getArticleId().find('input').fillInput(articleId)
  },
  getDoi() {
    return cy.getByDataTestId(DOI_FIELD).find('input')
  },
  fillInDoi(doi) {
    this.getDoi().fillInput(doi)
  },
  getPreprintUri() {
    return cy.getByDataTestId(SOURCE_URI_FIELD).find('input')
  },
  fillInPreprintUri(sourceUri) {
    this.getPreprintUri().fillInput(sourceUri)
  },
  getReview1Date() {
    return cy.getByDataTestId(REVIEW_1_DATE_FEILD)
  },
  fillInReview1Date(review1Date) {
    this.getReview1Date().find('input').fillInput(review1Date)
  },
  getReview1() {
    return cy.get(SUBMISSION_REVIEW1)
  },
  fillInReview1(review1) {
    this.getReview1()
      .scrollIntoView()
      .clear()
      .focus()
      .type(`{selectall}${review1}`, { force: true })
  },
  getReview1Creator() {
    return cy.getByDataTestId(REVIEW_1_CREATOR_FIELD)
  },
  fillInReview1Creator(review1Creator) {
    this.getReview1Creator().find('input').fillInput(review1Creator)
  },
  getReview2() {
    return cy.get(SUBMISSION_REVIEW2)
  },
  fillInReview2(review2) {
    this.getReview2()
      .scrollIntoView()
      .clear()
      .focus()
      .type(`{selectall}${review2}`, { force: true })
  },
  getReview2Creator() {
    return cy.getByDataTestId(REVIEW_2_CREATOR_FIELD)
  },
  fillInReview2Creator(review2Creator) {
    this.getReview2Creator().find('input').fillInput(review2Creator)
  },
  getReview2Date() {
    return cy.getByDataTestId(REVIEW_2_DATE_FEILD)
  },
  fillInReview2Date(review2Date) {
    this.getReview2Date().find('input').fillInput(review2Date)
  },
  getReview3() {
    return cy.get(SUBMISSION_REVIEW3)
  },
  fillInReview3(review3) {
    this.getReview3()
      .scrollIntoView()
      .clear()
      .focus()
      .type(`{selectall}${review3}`, { force: true })
  },
  getReview3Creator() {
    return cy.getByDataTestId(REVIEW_3_CREATOR_FIELD)
  },
  fillInReview3Creator(review3Creator) {
    this.getReview3Creator().find('input').fillInput(review3Creator)
  },
  getReview3Date() {
    return cy.getByDataTestId(REVIEW_3_DATE_FEILD)
  },
  fillInReview3Date(review3Date) {
    this.getReview3Date().find('input').fillInput(review3Date)
  },
  getSummary() {
    return cy.get(SUBMISSION_SUMMARY)
  },
  fillInSummary(summary) {
    this.getSummary()
      .scrollIntoView()
      .clear()
      .focus()
      .type(`{selectall}${summary}`, { force: true })
  },
  getSummaryCreator() {
    return cy.getByDataTestId(SUMMARY_CREATOR_FIELD)
  },
  fillInSummaryCreator(summaryCreator) {
    this.getSummaryCreator().find('input').fillInput(summaryCreator)
  },
  getSummaryDate() {
    return cy.getByDataTestId(SUMMARY_DATE)
  },
  fillInSummaryDate(summaryDate) {
    this.getSummaryDate().find('input').fillInput(summaryDate)
  },
  getStudySettingField() {
    return this.getWaxInputBox(1)
  },
  fillInStudySetting(studySetting) {
    this.getStudySettingField()
      .find(CONTENT_EDITABLE_VALUE)
      .fillInput(studySetting)
  },
  getStudySettingContent() {
    return this.getStudySettingField().find('p')
  },

  getMainFindingsContent() {
    return this.getMainFindingsField().find('p')
  },

  getStudyStrengthsContent() {
    return this.getStudyStrengthsField().find('p')
  },

  getLimitationsContent() {
    return this.getLimitationsField().find('p')
  },
  getValueAddedField() {
    return this.getWaxInputBox(4)
  },
  fillInValueAdded(valueAdded) {
    this.getValueAddedField().find(CONTENT_EDITABLE_VALUE).fillInput(valueAdded)
  },
  getValueAddedContent() {
    return this.getValueAddedField().find('p')
  },
  getTopicsCheckboxWithText(value) {
    return cy.getByNameAndValue(TOPICS_CHECKBOX_LIST, value)
  },
  getTopicsCheckboxContainsText(value) {
    return cy.getByNameAndContainsValue(TOPICS_CHECKBOX_LIST, value)
  },
  getSubTopicsCheckboxContainingText(value) {
    return cy.getByNameAndValue(SUB_TOPICS_CHECKBOX_LIST, value)
  },
  getCheckedTopics() {
    return cy.get(`[name="${TOPICS_CHECKBOX_LIST}"][checked]`)
  },
  getCheckedTopicsCount() {
    return cy.get(`[name="${TOPICS_CHECKBOX_LIST}"][checked]`).its('length')
  },
  clickTopicsCheckboxWithText(value) {
    this.getTopicsCheckboxWithText(value).click()
  },
  clickTopicsCheckboxContainsText(value) {
    this.getTopicsCheckboxContainsText(value).click()
  },
  waitThreeSec() {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000)
  },
  getAssignEditor(nth) {
    return cy.get(ASSIGN_EDITORS_DROPDOWN).eq(nth)
  },
  getFirstAuthorField() {
    return cy.getByDataTestId(FIRST_AUTHOR_FIELD).find('input')
  },
  fillInFirstAuthor(firstAuthor) {
    this.getFirstAuthorField().fillInput(firstAuthor)
  },
  getDatePublishedField() {
    return cy.getByDataTestId(DATE_PUBLISHED_FIELD).find('input')
  },
  fillInDatePublished(datePublished) {
    this.getDatePublishedField().fillInput(datePublished)
  },
  getJournalField() {
    return cy.getByDataTestId(JOURNAL_FIELD)
  },
  fillInJournal(journal) {
    this.getJournalField().fillInput(journal)
  },
  getReviewerField() {
    return cy.getByDataTestId(REVIEWER_FIELD)
  },
  fillInReviewer(reviewer) {
    this.getReviewerField().fillInput(reviewer)
  },
  getEditDateField() {
    return cy.getByDataTestId(EDIT_DATE_FIELD).find('input')
  },
  fillInEditDate(editDate) {
    this.getEditDateField().fillInput(editDate)
  },
  checkEditDateIsUpdated() {
    const getTodayDate = () => {
      const date = new Date()
      const year = date.getFullYear()
      let month = date.getMonth() + 1
      let day = date.getDate()

      if (month <= 9) {
        month = `0${month}`
      }

      if (day <= 9) {
        day = `0${day}`
      }

      return `${year}-${month}-${day}`
    }

    this.getEditDateField().should('have.value', getTodayDate())
  },
  getReviewCreatorField() {
    return cy.getByDataTestId(REVIEW_CREATOR_FIELD).find('input')
  },
  fillInReviewCreator(reviewCreator) {
    this.getReviewCreatorField().fillInput(reviewCreator)
  },

  getAbstractContent() {
    return this.getAbstractField().find('p').invoke('text')
  },
  getAbstractFieldColab() {
    return this.getWaxInputBox(0)
  },
  fillInAbstractColab(abstract) {
    this.getAbstractFieldColab().fillInput(abstract)
  },

  getWordCountInfo() {
    return cy.getByTitle(WORD_COUNT_INFO)
  },
}

export default SubmissionFormPage
