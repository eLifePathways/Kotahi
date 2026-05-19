/* eslint-disable promise/always-return */

import { dashboard } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('manuscripts page tests - Filter, sort, bulk select, archive', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)
    // cy.task('seedForms')

    // login as admin

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    DashboardPage.getHeader().should('be.visible')

    cy.submitNewEntry('Ready to evaluate', '123')
    cy.submitNewEntry('Evaluated', 'abc')
    // cy.submitNewEntry('Ready to evaluate', 'def')

    DashboardPage.clickSubmit()
    NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    cy.fixture('submission_form_data').then(data => {
      NewSubmissionPage.setCustomStatusField('Ready to evaluate')
      SubmissionFormPage.fillInTitle('def')
      SubmissionFormPage.fillInDoi(data.doi)
      SubmissionFormPage.getWaxField(0).fillInput(data.abstract)
      SubmissionFormPage.fillInFirstAuthor(data.creator)
      SubmissionFormPage.fillInDatePublished(data.date)
      SubmissionFormPage.fillInPreprintUri(data.doi)
      SubmissionFormPage.getWaxField(1).fillInput(data.ourTake)
      SubmissionFormPage.getWaxField(2).fillInput(data.mainFindings)
      SubmissionFormPage.getWaxField(3).fillInput(data.studyStrengths)
      SubmissionFormPage.getWaxField(4).fillInput(data.limitations)
      SubmissionFormPage.fillInKeywords(data.keywords)
      SubmissionFormPage.fillInReviewCreator(data.creator)
      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.clickSubmitManuscriptAndWaitPageLoad()
    })
  })

  beforeEach(() => {
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    Menu.clickManuscriptsAndAssertPageLoad()
  })

  context('checkbox tests for 3 manuscripts', () => {
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
  })

  context('filter and sort articles', () => {
    it('filter per status', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 4)
      ManuscriptsPage.clickStatus(-1)
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      ManuscriptsPage.getStatus(0).should('contain', 'Unsubmitted')
      cy.url().should('contain', 'new')
    })

    it('filter per label', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 4)
      cy.get('div.Select__ValueWrapper-sc-1hsx83u-0.gUXMXr').should(
        'be.visible',
      )
      ManuscriptsPage.selectCustomStatus('Ready to evaluate')
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      cy.url().should('contain', 'readyToEvaluate')
      ManuscriptsPage.getLabelRow(0).should('contain', 'Ready to evaluate')
      ManuscriptsPage.getLabelRow(1).should('contain', 'Ready to evaluate')
      ManuscriptsPage.getLabelRow(2).should('contain', 'Ready to evaluate')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.selectCustomStatus('Evaluated')
      ManuscriptsPage.getTableRowsCount().should('eq', 2)
      cy.url().should('contain', 'evaluated')
      ManuscriptsPage.getLabelRow(0).should('contain', 'Evaluated')
      ManuscriptsPage.getLabelRow(1).should('contain', 'Evaluated')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.selectCustomStatus('Ready to publish')
      ManuscriptsPage.getTableRowsCount().should('eq', 1)
      cy.url().should('contain', 'readyToPublish')
      ManuscriptsPage.getLabelRow(0).should('contain', 'Ready to publish')
    })
  })

  context('archiving articles', () => {
    it('cancel archiving articles', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 4)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.clickClose()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 3)
    })

    it('archive one article', () => {
      ManuscriptsPage.clickArticleCheckbox(0)
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.clickConfirm()
      ManuscriptsPage.getNumberOfAvailableArticles().should('contain', 2)
    })

    it('archive all articles', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.getConfirmationMessageForBulkDelete().should(
        'contain',
        'Please confirm you wish to archive the selected manuscripts.',
      )
      ManuscriptsPage.clickConfirm()
      ManuscriptsPage.getConfirmationMessageForBulkDelete().should('not.exist')

      cy.contains('No matching manuscripts were found').should('exist')
      ManuscriptsPage.getTableRowsCount().should('eq', 1)
    })
  })
})

Cypress.Commands.add('submitNewEntry', (status, title) => {
  DashboardPage.clickSubmit()
  NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
  NewSubmissionPage.setCustomStatusField(status)
  SubmissionFormPage.fillInTitle(title)
  Menu.clickDashboardAndVerifyPageLoaded()
})
