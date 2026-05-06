/* eslint-disable promise/always-return */

import { Menu } from '../../page-object/page-component/menu'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { manuscripts } from '../../support/routes2'

const invalidDoiLnk = 'https://hours.com'
describe('validating required field and doi values in submission form', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.elife_bootstrap`)

    // login as admin
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    ManuscriptsPage.getTableHead().should('be.visible')
    ManuscriptsPage.clickSubmit()
    NewSubmissionPage.clickSubmitUrlAndWaitPageLoadElife()
  })

  beforeEach(() => {
    // login as admin
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    ManuscriptsPage.getTableHead().should('be.visible')
    Menu.clickManuscripts()
    ManuscriptsPage.getOptionsElifeText('Evaluation').click()
  })

  context('check the Submission form based on form builder', () => {
    it('check if the form contain all the fields', () => {
      cy.fixture('form_option').then(data => {
        const formElements = [
          data.preprint1.articleId,
          data.preprint1.articleDoi,
          data.preprint1.bioRxivArticleUrl,
          data.preprint1.description,
          data.preprint1.review1,
          data.preprint1.review1Creator,
          data.preprint1.review1Date,
          data.preprint1.review2,
          data.preprint1.review2Creator,
          data.preprint1.review2Date,
          data.preprint1.review3,
          data.preprint1.review3Creator,
          data.preprint1.review3Date,
          data.preprint1.summary,
          data.preprint1.summaryCreator,
          data.preprint1.summaryDate,
        ]

        for (let i = 0; i < formElements.length; i += 1) {
          SubmissionFormPage.getFormOptionList(i).should(
            'contain',
            formElements[i],
          )
        }
      })
    })

    // check if it is displayed the required message
    it('check required message', () => {
      SubmissionFormPage.clickElifeSubmitResearch()

      cy.fixture('form_option').then(data => {
        for (let i = 0; i < 4; i++) {
          SubmissionFormPage.getFormOptionList(i)
            .get('[class*="MessageWrapper"]')
            .should('contain', data.required)
        }
      })
    })
  })

  context('DOI validations', () => {
    it('check doi link is available in submission form', () => {
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleld(data.articleId)
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInPreprintUri(data.articleId)
        SubmissionFormPage.fillInTitle(data.description)
        SubmissionFormPage.clickElifeSubmitResearch()

        // check for the submission form contains doi
        ManuscriptsPage.getOptionsElifeText('Evaluation').click()
        SubmissionFormPage.getDoi().should(
          'have.value',
          data.doi.split('https://doi.org/')[1],
        )
      })
    })

    it('error message is available for incorrect doi link', () => {
      SubmissionFormPage.fillInDoi(invalidDoiLnk)
      SubmissionFormPage.clickElifeSubmitResearch()
      SubmissionFormPage.getValidationErrorMessage('DOI is invalid')
    })
  })
})
