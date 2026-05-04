/* eslint-disable promise/always-return */
/* eslint-disable cypress/unsafe-to-chain-command */

import { FormsPage } from '../../page-object/forms-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

describe('Form builder', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.bootstrap`)
  })

  it('viewing and adding fields in Submission, Review and Decision forms', () => {
    // login as admin

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })

    // enter the form page and assert the fields
    Menu.clickSettings()
    Menu.clickForms()
    cy.contains('Submission').click()

    // For Submission field
    FormsPage.getFormTitleTab(0).should(
      'contain',
      'Research Object Submission Form',
    )
    FormsPage.clickFormOption(1)
    FormsPage.getFieldValidate().scrollIntoView().click()
    cy.get('[class*="react-select__option"]').eq(0).click()
    cy.contains('Save').click()
    // adding a field in submission form
    cy.get('[title="Add a field..."]').click()
    cy.getByDataTestId('fieldType').click()
    cy.contains('Single image attachment').scrollIntoView().click()
    cy.contains('Save').click()

    // for review field
    // Menu.clickSettings()
    cy.contains('Review').click()
    FormsPage.getFormTitleTab(0).should('contain', 'Review')
    FormsPage.clickFormOption(1)
    FormsPage.getNameField().should('have.value', 'files').clear()
    FormsPage.getNameField().type('files')
    cy.contains('Save').click()

    // adding a field in review form
    cy.get('[title="Add a field..."]').click()
    cy.getByDataTestId('fieldType').click()
    cy.get('[class*="react-select__option"]')
      .contains('Rich text')
      .scrollIntoView()
      .click({ force: true })
    FormsPage.getNameField().click().type('newField')
    cy.contains('Save').click()

    // for decision field
    // Menu.clickSettings()
    cy.contains('Decision').click()
    FormsPage.getFormTitleTab(0).should('contain', 'Decision')
    FormsPage.clickFormOption(1)
    FormsPage.getNameField().should('have.value', 'files').clear()
    FormsPage.getNameField().type('files')
    cy.contains('Save').click()

    // adding a field in decision form
    cy.get('[title="Add a field..."]').click({ force: true })
    cy.get('[data-testid="fieldType"]').click()
    // cy.get('button')

    cy.get('[class*="react-select__option"]')
      .contains('Rich text')
      .scrollIntoView()
      .click()
    FormsPage.getNameField().click().type('newField')
    cy.contains('Save').click()
  })

  it('cannot submit manuscript without filling in the required fields', () => {
    // login as author and attempt to submit an incomplete submission form

    cy.fixture('role_names').then(name => {
      cy.login(name.role.author, dashboard)

      Menu.clickDashboard()
      // Click on new submission
      ManuscriptsPage.clickSubmit()

      // Upload manuscript
      cy.get('input[type=file]').selectFile('cypress/fixtures/test-pdf.pdf', {
        force: true,
      })
      cy.get('[data-testid="submission.$title"]').clear()
      cy.get('[data-testid="submission.$title"]').should('have.length', 1)
      SubmissionFormPage.clickSubmitResearch()
    })

    // Change the title so that we can look for it
    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInField('submission.$title', data.newTitle)
      SubmissionFormPage.clickSubmitResearch()
      // Submit the form
      SubmissionFormPage.clickSubmitYourManuscript()
      // Contains new title
      cy.awaitDisappearSpinner()
      // the following line is added so that it gives enough time for the dom to update the title of the submission in dashboard.
      DashboardPage.clickDashboardTab(1)
      DashboardPage.clickDashboardTab(0)
      DashboardPage.getSubmissionTitle(0).should('contain', data.newTitle)
    })
  })
})
