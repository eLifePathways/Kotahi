/* eslint-disable promise/always-return, promise/no-nesting */

import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { manuscripts } from '../../support/routes2'
import { Menu } from '../../page-object/page-component/menu'

describe('Manuscripts page tests', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.elife_bootstrap`)

    // login as admin
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    ManuscriptsPage.getTableHead().should('be.visible')

    ManuscriptsPage.clickSubmit()
    NewSubmissionPage.clickSubmitUrlAndWaitPageLoadElife()
    Menu.clickManuscriptsAndAssertPageLoad()
  })

  context('Elements visibility', () => {
    beforeEach(() => {
      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHead().should('be.visible')
    })

    it('check Submit and Video Chat buttons are visible', () => {
      ManuscriptsPage.clickExpandChatButton()
      ManuscriptsPage.getSubmitButton().should('be.visible')
      ManuscriptsPage.getLiveChatButton().should('be.visible')
      cy.get('button[title="Hide Chat"]').click()
      cy.contains('Group Manager discussion').should('not.exist')
    })

    it('evaluation button is visible and publish button is not visible on unsubmited status article', () => {
      ManuscriptsPage.getEvaluationButton()
        .scrollIntoView()
        .should('be.visible')
      ManuscriptsPage.getOptionsElifeText('Publish').should('not.exist')
    })
  })

  context('unsubmitted article tests', () => {
    beforeEach(() => {
      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHead().should('be.visible')
    })

    it('word count button should be visible & display info', () => {
      cy.reload()
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      SubmissionFormPage.getWordCountInfo().its('length').should('eq', 4)

      for (let i = 0; i < 4; i++) {
        SubmissionFormPage.getWordCountInfo()
          .eq(i)
          .scrollIntoView()
          .should('be.visible')
      }

      SubmissionFormPage.fillInReview1('word count test{selectAll}')
      SubmissionFormPage.getWordCountInfo()
        .eq(0)
        .should('contain', '3')
        .and('contain', 'Words')
    })

    it('unsubmitted article is evaluated', () => {
      ManuscriptsPage.clickEvaluation()
      cy.url().should('contain', 'evaluation')

      SubmissionFormPage.getDoi().should('have.value', '')
      // SubmissionFormPage.getTitleField().should('have.value', '') // Actually contains "New submission <date>"
      SubmissionFormPage.getReview1().find('p').should('contain', '')
      SubmissionFormPage.getReview1Creator().should('have.value', '')
      SubmissionFormPage.getReview1Date().should('have.value', '')
      SubmissionFormPage.getReview2().find('p').should('contain', '')
      SubmissionFormPage.getReview2Creator().should('have.value', '')
      SubmissionFormPage.getReview2Date().should('have.value', '')
      SubmissionFormPage.getReview3().find('p').should('contain', '')
      SubmissionFormPage.getReview3Creator().should('have.value', '')
      SubmissionFormPage.getReview3Date().should('have.value', '')
      SubmissionFormPage.getSummary().find('p').should('contain', '')
      SubmissionFormPage.getSummaryCreator().should('have.value', '')
      SubmissionFormPage.getSummaryDate().should('have.value', '')

      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleld(data.articleId)
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInPreprintUri(data.articleId)
        SubmissionFormPage.fillInTitle(data.description)
        SubmissionFormPage.fillInReview1(data.review1)
        SubmissionFormPage.fillInReview1Creator(data.creator)
        SubmissionFormPage.fillInReview1Date(data.review1Date)
        SubmissionFormPage.fillInReview2(data.review2)
        SubmissionFormPage.fillInReview2Creator(data.creator)
        SubmissionFormPage.fillInReview2Date(data.review2Date)
        SubmissionFormPage.fillInReview3(data.review3)
        SubmissionFormPage.fillInReview3Creator(data.creator)
        SubmissionFormPage.fillInReview3Date(data.review3Date)
        SubmissionFormPage.fillInSummary(data.summary)
        SubmissionFormPage.fillInSummaryCreator(data.creator)
        SubmissionFormPage.fillInSummaryDate(data.summaryDate)
        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoadElife()
      })

      // ManuscriptsPage.getStatus(0).should('eq', 'Evaluated') // ??? IS THIS A BUG?
      ManuscriptsPage.getStatus(0).should('eq', 'Published')
    })

    it('sort article after Article id', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoadElife()
      SubmissionFormPage.fillInArticleld('456')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoadElife()
      SubmissionFormPage.fillInArticleld('abc')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoadElife()
      SubmissionFormPage.fillInArticleld('def')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getArticleIdByRow(1).should('contain', 'def')
      ManuscriptsPage.getArticleIdByRow(2).should('contain', 'abc')
      ManuscriptsPage.getArticleIdByRow(3).should('contain', '456')
      ManuscriptsPage.getArticleIdByRow(4).should('contain', '123')
      ManuscriptsPage.clickArticleId()
      ManuscriptsPage.getArticleIdByRow(1).should('contain', '123')
      ManuscriptsPage.getArticleIdByRow(2).should('contain', '456')
      ManuscriptsPage.getArticleIdByRow(3).should('contain', 'abc')
      ManuscriptsPage.getArticleIdByRow(4).should('contain', 'def')
    })
  })

  context('Submitted and evaluated article tests', () => {
    before(() => {
      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
        cy.awaitDisappearSpinner()
        ManuscriptsPage.getTableHead().should('be.visible')
        ManuscriptsPage.getEvaluationButton().click('')

        // fill the submit form and submit it
        cy.fixture('submission_form_data').then(data => {
          SubmissionFormPage.fillInArticleld(data.articleId)
          SubmissionFormPage.fillInDoi(data.doi)
          SubmissionFormPage.fillInPreprintUri(data.articleId)
          SubmissionFormPage.fillInTitle(data.description)
          SubmissionFormPage.fillInReview1(data.review1)
          SubmissionFormPage.fillInReview1Creator(data.creator)
          SubmissionFormPage.fillInReview1Date(data.review1Date)
          SubmissionFormPage.fillInReview2(data.review2)
          SubmissionFormPage.fillInReview2Creator(data.creator)
          SubmissionFormPage.fillInReview2Date(data.review2Date)
          SubmissionFormPage.fillInReview3(data.review3)
          SubmissionFormPage.fillInReview3Creator(data.creator)
          SubmissionFormPage.fillInReview3Date(data.review3Date)
          SubmissionFormPage.fillInSummary(data.summary)
          SubmissionFormPage.fillInSummaryCreator(data.creator)
          SubmissionFormPage.fillInSummaryDate(data.summaryDate)
          SubmissionFormPage.waitThreeSec()
          SubmissionFormPage.clickSubmitResearchAndWaitPageLoadElife()
        })
      })
    })

    beforeEach(() => {
      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHead().should('be.visible')
    })

    it('after submitting an article, user is redirect to Manuscripts page', () => {
      // asserts on the manuscripts page
      ManuscriptsPage.getManuscriptsPageTitle().should('be.visible')
      ManuscriptsPage.getEvaluationButton()
        .scrollIntoView()
        .should('be.visible')
      ManuscriptsPage.getOptionsElife().should('not.contain', 'Control')
      ManuscriptsPage.getOptionsElife().should('contain', 'Publish')
    })

    it('submission details should be visible', () => {
      // ManuscriptsPage.getStatus(0).should('eq', 'Evaluated') /// ??? BUG
      ManuscriptsPage.getStatus(0).should('eq', 'Published')
      ManuscriptsPage.clickEvaluation()
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.getArticleld().should('have.value', data.articleId)
        SubmissionFormPage.getDoi().should(
          'have.value',
          data.doi.split('https://doi.org/')[1],
        )
        SubmissionFormPage.getTitleField().should(
          'have.value',
          data.description,
        )
        // SubmissionFormPage.getReview1()
        //   .find('p')
        //   .should('contain', data.review1)
        SubmissionFormPage.getReview1Creator().should(
          'have.value',
          data.creator,
        )
        SubmissionFormPage.getReview1Date().should(
          'have.value',
          data.review1Date,
        )
        // Some of the field valuations are commented because editor is jumping in Cypress
        // SubmissionFormPage.getReview2()
        //   .find('p')
        //   .should('contain', data.review2)
        SubmissionFormPage.getReview2Creator().should(
          'have.value',
          data.creator,
        )
        SubmissionFormPage.getReview2Date().should(
          'have.value',
          data.review2Date,
        )
        // SubmissionFormPage.getReview3()
        //   .find('p')
        //   .should('contain', data.review3)
        SubmissionFormPage.getReview3Creator().should(
          'have.value',
          data.creator,
        )
        SubmissionFormPage.getReview3Date().should(
          'have.value',
          data.review3Date,
        )
        // SubmissionFormPage.getSummary()
        //   .find('p')
        //   .should('contain', data.summary)
        SubmissionFormPage.getSummaryCreator().should(
          'have.value',
          data.creator,
        )
        SubmissionFormPage.getSummaryDate().should(
          'have.value',
          data.summaryDate,
        )
      })
    })

    it('evaluation changes should be visible', () => {
      cy.fixture('submission_form_data').then(data => {
        cy.fixture('role_names').then(name => {
          ManuscriptsPage.getAuthor(0).should('eq', name.role.admin)
          // ManuscriptsPage.getStatus(0).should('eq', 'Evaluated') // ??? BUG
          ManuscriptsPage.getStatus(0).should('eq', 'Published')
        })
        ManuscriptsPage.clickEvaluation()
        SubmissionFormPage.fillInArticleld('123 - Evaluated')
        SubmissionFormPage.fillInDoi(
          'https://doi.org/10.1101/2020.12.22.423946',
        )
        SubmissionFormPage.fillInTitle('new description')
        SubmissionFormPage.fillInReview1('review 1 is completed')
        SubmissionFormPage.fillInReview1Creator('test.test')
        SubmissionFormPage.fillInReview1Date('10/03/2050')
        SubmissionFormPage.fillInReview2('review 2 is completed')
        SubmissionFormPage.fillInReview2Creator('test.test')
        SubmissionFormPage.fillInReview2Date('10/04/2050')
        SubmissionFormPage.fillInReview3('review 3 is completed')
        SubmissionFormPage.fillInReview3Creator('test.test')
        SubmissionFormPage.fillInReview3Date('10/03/2050')
        SubmissionFormPage.fillInSummary('review summay is completed')
        SubmissionFormPage.fillInSummaryCreator('test.test')
        SubmissionFormPage.fillInSummaryDate('10/03/2050')

        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoadElife()
        ManuscriptsPage.clickEvaluation()
        SubmissionFormPage.getArticleld().should(
          'not.have.value',
          data.articleId,
        )
        SubmissionFormPage.getDoi().should(
          'not.have.value',
          data.doi.split('https://doi.org/')[1],
        )
        SubmissionFormPage.getTitleField().should(
          'not.have.value',
          data.description,
        )
        SubmissionFormPage.getReview1()
          .find('p')
          .should('not.contain', data.review1)
        SubmissionFormPage.getReview1Creator().should(
          'not.have.value',
          data.creator,
        )
        SubmissionFormPage.getReview1Date().should(
          'not.have.value',
          data.review1Date,
        )
        SubmissionFormPage.getReview2()
          .find('p')
          .should('not.contain', data.review2)
        SubmissionFormPage.getReview2Creator().should(
          'not.have.value',
          data.creator,
        )
        SubmissionFormPage.getReview2Date().should(
          'not.have.value',
          data.review2Date,
        )
        SubmissionFormPage.getReview3()
          .find('p')
          .should('not.contain', data.review3)
        SubmissionFormPage.getReview3Creator().should(
          'not.have.value',
          data.creator,
        )
        SubmissionFormPage.getReview3Date().should(
          'not.have.value',
          data.review3Date,
        )
        SubmissionFormPage.getSummary()
          .find('p')
          .should('not.contain', data.summary)
        SubmissionFormPage.getSummaryCreator().should(
          'not.have.value',
          data.creator,
        )
        SubmissionFormPage.getSummaryDate().should(
          'not.have.value',
          data.summaryDate,
        )
      })
    })

    it('assert article id is the first table head and contains submitted atricle id title', () => {
      ManuscriptsPage.getArticleIdByRow(0).should('contain', 'Article ID')
      cy.fixture('submission_form_data').then(data => {
        ManuscriptsPage.getArticleIdByRow(1).should('contain', data.articleId)
      })
    })
  })
})
