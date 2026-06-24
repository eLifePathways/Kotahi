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
      SubmissionFormPage.getArticleId().should('exist')
      SubmissionFormPage.getDoi().should('exist')
      SubmissionFormPage.getPreprintUri().should('exist')
      SubmissionFormPage.getTitleField().should('exist')
      SubmissionFormPage.getReview1().should('exist')
      SubmissionFormPage.getReview1Creator().should('exist')
      SubmissionFormPage.getReview1Date().should('exist')
      SubmissionFormPage.getReview2().should('exist')
      SubmissionFormPage.getReview2Creator().should('exist')
      SubmissionFormPage.getReview2Date().should('exist')
      SubmissionFormPage.getReview3().should('exist')
      SubmissionFormPage.getReview3Creator().should('exist')
      SubmissionFormPage.getReview3Date().should('exist')
      SubmissionFormPage.getSummary().should('exist')
      SubmissionFormPage.getSummaryCreator().should('exist')
      SubmissionFormPage.getSummaryDate().should('exist')
    })

    // check if it is displayed the required message
    it('check required message', () => {
      SubmissionFormPage.clickElifeSubmitResearch()

      cy.fixture('form_option').then(data => {
        for (let i = 0; i < 4; i++) {
          SubmissionFormPage.getFormOptionList(i)
            .get('[data-testid="field-error-message"]')
            .should('contain', data.required)
        }
      })
    })
  })

  context('DOI validations', () => {
    it('check doi link is available in submission form', () => {
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInArticleId(data.articleId)
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
