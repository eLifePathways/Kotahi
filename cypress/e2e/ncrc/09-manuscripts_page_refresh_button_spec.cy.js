/* eslint-disable promise/always-return, promise/catch-or-return, promise/no-nesting */

import {
  manuscripts,
  manuscriptStatus,
  unsubmitted,
  submitted,
  evaluated,
  published,
} from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'

describe.skip('refresh button tests', () => {
  context('visibility check', () => {
    it('check button exists and is visible', () => {
      const restoreUrl = Cypress.config('restoreUrl')
      const seedFormsUrl = Cypress.config('seedFormsUrl')

      cy.request('POST', `${restoreUrl}/initial_state_other`)
      cy.request('POST', seedFormsUrl)

      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHeader().should('be.visible')

      ManuscriptsPage.getRefreshButton().should('exist').and('be.visible')
    })
  })

  context('functionality check', () => {
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
      ManuscriptsPage.getTableHeader().should('be.visible')

      ManuscriptsPage.clickRefreshButton()
      // wait for data to be imported
      ManuscriptsPage.getSuccessfulImportPopup()
        .should('exist')
        .and('be.visible')
        .and('contain', 'Manuscripts successfully imported')
      cy.reload()
      cy.awaitDisappearSpinner()
    })

    beforeEach(() => {
      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHeader().should('be.visible')
    })

    it('the table should contain 100 entries', () => {
      ManuscriptsPage.getTableRowsCount().should('eq', 100)
      ManuscriptsPage.getNumberOfAvailableArticles()
        .invoke('text')
        .then(text => {
          expect(parseInt(text, 10)).to.be.gte(100)
        })
    })

    it('at least one topic should exist per imported article', () => {
      ManuscriptsPage.getTableRowsCount().then(length => {
        for (let i = 0; i < length; i++) {
          ManuscriptsPage.getStatus(i).should('be.eq', 'Unsubmitted')
          ManuscriptsPage.getArticleTopicByRow(i)
            .its('length')
            .should('be.gte', 1)
        }
      })
    })

    it('check imported article has data', () => {
      const randomArticle = Math.floor(Math.random() * 10)
      ManuscriptsPage.clickEvaluationNthAndVerifyUrl(randomArticle)
      SubmissionFormPage.getDoi().should('not.have.value', '')
      SubmissionFormPage.getTitleField().should('not.have.value', '')
      SubmissionFormPage.getCheckedTopics().should('exist')
      SubmissionFormPage.getCheckedTopicsCount().should('be.gte', 1)
      SubmissionFormPage.getAbstractContent().should('not.be.eq', '')
      SubmissionFormPage.getFirstAuthorField().should('not.have.value', '')
      SubmissionFormPage.getDatePublishedField().should('not.have.value', '')
      SubmissionFormPage.getJournalField().should('not.have.value', '')
    })

    it('check only unsubmitted articles are available', () => {
      ManuscriptsPage.getNumberOfAvailableArticles()
        .invoke('text')
        .then(allArticlesCount => {
          const importedArticlesCount = parseInt(allArticlesCount, 10)
          expect(importedArticlesCount).to.be.gt(0)
          cy.visit(manuscriptStatus + unsubmitted)
          cy.awaitDisappearSpinner()
          ManuscriptsPage.getNumberOfAvailableArticles()
            .invoke('text')
            .then(unsubmittedCount => {
              expect(parseInt(unsubmittedCount, 10)).to.be.eq(
                importedArticlesCount,
              )
            })
          cy.visit(manuscriptStatus + submitted)
          cy.awaitDisappearSpinner()
          ManuscriptsPage.getNumberOfAvailableArticles()
            .invoke('text')
            .then(submittedCount => {
              expect(parseInt(submittedCount, 10)).to.be.eq(0)
            })
          cy.visit(manuscriptStatus + evaluated)
          cy.awaitDisappearSpinner()
          ManuscriptsPage.getNumberOfAvailableArticles()
            .invoke('text')
            .then(evaluatedCount => {
              expect(parseInt(evaluatedCount, 10)).to.be.eq(0)
            })
          cy.visit(manuscriptStatus + published)
          cy.awaitDisappearSpinner()
          ManuscriptsPage.getNumberOfAvailableArticles()
            .invoke('text')
            .then(publishedCount => {
              expect(parseInt(publishedCount, 10)).to.be.eq(0)
            })
        })
    })

    it('check imported article can be evaluated', () => {
      const randomArticle = Math.floor(Math.random() * 10)
      ManuscriptsPage.clickEvaluationNthAndVerifyUrl(randomArticle)
      SubmissionFormPage.getTitleField()
        .invoke('val')
        .then(title => {
          cy.fixture('submission_form_data').then(data => {
            SubmissionFormPage.fillInOurTake(data.ourTake)
            SubmissionFormPage.clickStudyDesignDropdown()
            SubmissionFormPage.selectDropdownOption(0)
            SubmissionFormPage.fillInMainFindings(data.mainFindings)
            SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
            SubmissionFormPage.fillInLimitations(data.limitations)
            SubmissionFormPage.fillInValueAdded(data.valueAdded)
            SubmissionFormPage.clickCustomStatusDropdown()
            SubmissionFormPage.selectDropdownOption(0)
            SubmissionFormPage.fillInFirstAuthor(data.creator)
            SubmissionFormPage.fillInDatePublished(data.date)
            SubmissionFormPage.fillInJournal(data.journal)
            SubmissionFormPage.fillInReviewer(data.creator)
            SubmissionFormPage.fillInReviewCreator(data.creator)
            SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
          })
          cy.visit(manuscriptStatus + evaluated)
          cy.awaitDisappearSpinner()
          ManuscriptsPage.getArticleTitleByRow(0)
            .find('span')
            .invoke('text')
            .should('be.eq', title)
          ManuscriptsPage.getStatus(0).should('be.eq', 'Evaluated')
        })
    })
    it('reviewer should see article description on dashboard page', () => {
      const randomArticle = Math.floor(Math.random() * 10)
      ManuscriptsPage.clickEvaluationNthAndVerifyUrl(randomArticle)
      SubmissionFormPage.getTitleField()
        .invoke('val')
        .then(title => {
          cy.fixture('role_names').then(name => {
            SubmissionFormPage.getAssignEditor(0).click()
            SubmissionFormPage.selectDropdownOptionWithText(name.role.admin)
            SubmissionFormPage.waitThreeSec()
            Menu.clickManuscriptsAndAssertPageLoad()
            ManuscriptsPage.getEditorName().should('contain', name.role.admin)
          })
          Menu.clickDashboard()
          cy.awaitDisappearSpinner()
          DashboardPage.getVersionTitle().should('contain', title)
        })
    })
  })
})
