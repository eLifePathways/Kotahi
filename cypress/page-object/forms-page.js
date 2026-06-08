/// <reference types="Cypress" />
/**
 * Page object representing the second option from the left side menu,
 * which contains a number of options & fields to fill in / dropdowns.
 */
const FORM_TITLE_TAB = '[data-testid="tab-container"] > div'
const FORM_OPTION_LIST =
  '[data-testid=formbuilder-element] > button:nth-child(1)'
const NAME_FIELD = '[data-testid="name"]'
const COMPONENT_TYPE = '[role=listbox]'
const FIELD_TYPE = '[data-testid="fieldType"]'
const UPDATE_FORM_BUTTON = '[type=submit]'

export const FormsPage = {
  verifyPageLoaded() {
    cy.awaitDisappearSpinner()
    return cy.get(FORM_TITLE_TAB).eq(0).should('be.visible')
  },
  getFormTitleTab(nth) {
    return cy.get(FORM_TITLE_TAB).eq(nth)
  },
  getFormTitleText(nth) {
    this.getFormTitleTab(nth).invoke('text')
  },
  getFormOptionList() {
    return cy.get(FORM_OPTION_LIST)
  },
  clickFormOption(nth) {
    this.getFormOptionList().eq(nth).click({ force: true })
  },
  clickFormOptionWithText(text) {
    this.getFormOptionList().contains(text).click({ force: true })
  },
  getFormBuilderElementName(nth) {
    return cy.get(FORM_OPTION_LIST).eq(nth)
  },
  getNameField() {
    return cy.get(NAME_FIELD)
  },
  getComponentType() {
    return cy.get(COMPONENT_TYPE)
  },
  getFieldType() {
    return cy.get(FIELD_TYPE)
  },
  getFieldValidate() {
    return cy.getByDataTestId('validate')
  },
  getDoiValidation(nth) {
    return cy
      .get('input[type="radio"][name="doiValidation"]')
      .eq(nth)
      .scrollIntoView()
  },
  clickOptionsDoiValidation(nth) {
    this.getDoiValidation(nth).parent().click()
  },
  clickUpdateForm() {
    return cy.get(UPDATE_FORM_BUTTON).click()
  },
}

export default FormsPage
