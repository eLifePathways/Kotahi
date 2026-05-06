/* eslint-disable promise/always-return */

import { manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'

describe.skip('manuscripts page checkboxes tests', () => {
  context('unsubmitted manuscripts checkbox tests', () => {
    before(() => {
      const restoreUrl = Cypress.config('restoreUrl')
      const seedFormsUrl = Cypress.config('seedFormsUrl')

      cy.request('POST', `${restoreUrl}/initial_state_other`)
      cy.request('POST', seedFormsUrl)

      // login as admin

      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInTitle('123')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInTitle('abc')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInTitle('def')
      Menu.clickManuscriptsAndAssertPageLoad()
    })
    beforeEach(() => {
      // login as admin

      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
    })
    it('checkbox visibility', () => {
      ManuscriptsPage.getSelectAllCheckbox().should('be.visible')
      ManuscriptsPage.getAllArticleCheckboxesLength().should('eq', 3)
    })
    it('select an article & check selection', () => {
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 0)
      ManuscriptsPage.clickArticleCheckbox(1)
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 1)
    })
    it('select & deselect all articles and check count', () => {
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 0)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 3)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 0)
    })
    it('click Close to not delete the articles', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.clickClose()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 3)
    })
    it('delete selected article', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.getConfirmationMessageForBulkDelete().should(
        'contain',
        'Please confirm you would like to delete selected articles',
      )
      ManuscriptsPage.clickConfirm()
      ManuscriptsPage.getTableRow().should('not.exist')
    })
  })
  context('submitted manuscripts checkbox tests', () => {
    it('checkbox should not be visible for submitted manuscripts', () => {
      const restoreUrl = Cypress.config('restoreUrl')
      const seedFormsUrl = Cypress.config('seedFormsUrl')

      cy.request('POST', `${restoreUrl}/initial_state_other`)
      cy.request('POST', seedFormsUrl)

      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInTitle(data.articleId)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.clickStudyDesignDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInValueAdded(data.valueAdded)
        SubmissionFormPage.clickCustomStatusDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInJournal(data.journal)
        SubmissionFormPage.fillInReviewer(data.creator)
        SubmissionFormPage.fillInReviewCreator(data.creator)

        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
      })
      ManuscriptsPage.getAllArticleCheckboxes().should('not.exist')
    })
  })
})
