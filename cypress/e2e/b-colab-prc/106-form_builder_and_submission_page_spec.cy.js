/* eslint-disable promise/always-return */
/* eslint-disable cypress/unsafe-to-chain-command */

import { FormsPage } from '../../page-object/forms-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes1'
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'

describe('Form builder and Submission pages', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)
  })

  it('viewing and adding fields in Submission, Review and Decision forms', () => {
    // login as admin

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })

    // Navigate to Forms
    Menu.clickSettings()
    Menu.clickForms()

    // === Submission Form ===
    cy.contains('Submission').click()
    FormsPage.getFormTitleTab(0).should(
      'contain',
      'Research Object Submission Form',
    )
    FormsPage.clickFormOption(1)
    FormsPage.getFieldValidate().scrollIntoView().click()
    cy.log('Admin makes DOI a required field.')
    cy.get('[class*="react-select__option"]').eq(0).click()
    cy.contains('Save').click()

    //  Add field: Single image attachment
    cy.get('[title="Add a field..."]').click()
    cy.getByDataTestId('fieldType').click()
    cy.contains('Single image attachment').scrollIntoView().click()
    cy.contains('Save').click()

    // === Review Form ===
    cy.contains('Review').click()
    FormsPage.getFormTitleTab(0).should('contain', 'Review')
    FormsPage.clickFormOption(1)
    FormsPage.getNameField().should('have.value', 'files').clear()
    cy.get('[name=name]').type('files')
    cy.contains('Save').click()

    // Add field: Attachments
    cy.get('[title="Add a field..."]').click()
    cy.getByDataTestId('fieldType').click()
    cy.get('[class*="react-select__option"]')
      .contains('Attachments')
      .scrollIntoView()
      .click()
    cy.getByDataTestId('title').click().type('More attachments')
    cy.get('[name=name]').click().type('moreAttachments')
    cy.contains('Save').click()

    // === Decision Form ===
    cy.contains('Decision').click()
    FormsPage.getFormTitleTab(0).should('contain', 'Decision')
    FormsPage.clickFormOption(1)
    FormsPage.getNameField().should('have.value', 'files').clear()
    cy.get('[name=name]').type('files')
    cy.contains('Save').click()

    // Add field: DOI suffix
    cy.get('[title="Add a field..."]').click()
    cy.getByDataTestId('fieldType').click()
    cy.contains('DOI suffix').click()
    cy.contains('Save').click()
  })

  context('checking edit submission info page', () => {
    before(() => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.author, dashboard)
      })

      Menu.clickDashboard()
      // Click on new submission
      DashboardPage.clickSubmissionButton()

      // Upload manuscript
      cy.get('input[type=file]').selectFile('cypress/fixtures/test-pdf.pdf', {
        force: true,
      })
    })

    beforeEach(() => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.author, dashboard)
      })
      cy.contains('Continue Submission').click()
    })

    it('word count button should be visible & display info', () => {
      SubmissionFormPage.getWordCountInfo().its('length').should('eq', 5)

      for (let i = 0; i < 5; i++) {
        SubmissionFormPage.getWordCountInfo()
          .eq(i)
          .scrollIntoView()
          .should('be.visible')
      }

      cy.getByClass('ProseMirror').eq(0).type('word count test{selectAll}')

      SubmissionFormPage.getWordCountInfo()
        .eq(0)
        .should('contain', '3')
        .and('contain', 'Words')
    })

    it("edit date should reflect today's date", () => {
      SubmissionFormPage.checkEditDateIsUpdated()
    })

    it('author can NOT upload manuscript without filling in all the required fields', () => {
      cy.get('[data-testid="submission.$title"]').clear()
      cy.get('[data-testid="submission.$title"]').should('have.length', 1)
      SubmissionFormPage.clickSubmitResearch()
      cy.contains('Required').should('exist')
    })

    it('author uploads manuscript after filling in all the required fields', () => {
      // Change the title so that we can look for it

      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInTitle(data.newTitle)
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInAbstractColab(data.abstract)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInPreprintUri(data.link)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInKeywords(data.keywords)
        SubmissionFormPage.fillInReviewCreator(data.creator)
        SubmissionFormPage.clickSubmitResearch()
        // Submit the form
        SubmissionFormPage.clickSubmitYourManuscript()

        cy.get('[data-test-id="tab-container"]:nth(0)')
          .should('contain', 'My Submissions')
          .should('exist')
        // Contains new title
        DashboardPage.getSubmissionTitle(0).should('contain', data.newTitle)
      })
    })
  })
})
