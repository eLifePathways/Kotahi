/* eslint-disable promise/always-return */

import { FormsPage } from '../../page-object/forms-page'
import { Menu } from '../../page-object/page-component/menu'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes2'

const bioRxivArticleUrl =
  'https://www.biorxiv.org/content/10.1101/2022.05.28.493855v1'

describe('Update the submission form field', () => {
  it('update submission form field for publishing to hypothesis group', () => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.elife_bootstrap`)

    // login as admin

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })

    // enter the from page and assert the fileds()
    Menu.clickSettings()
    Menu.clickForms()
    cy.contains('Submission').click()

    // For Submission field
    FormsPage.getFormTitleTab(0).should('contain', 'eLife Submission Form')
    FormsPage.clickFormOption(3)
    FormsPage.getFieldValidate()

    // cy.get(':nth-child(3) > .sc-dmlrTW').contains('Always').click()
    cy.get('[data-testid="publishingTag"]').type('test_tag')
    // cy.contains('Update Field').click({ force: true })
    cy.contains('Save').click({ force: true })
    Menu.clickManuscripts()
    ManuscriptsPage.clickSubmit()
    // Upload manuscript

    cy.get('button').contains('Submit a URL instead').click()

    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInArticleld(data.articleId)
      SubmissionFormPage.fillInDoi(data.doi)
      SubmissionFormPage.fillInPreprintUri(bioRxivArticleUrl)
      SubmissionFormPage.fillInTitle(data.description)
      // Verify that changes are autosaved
      SubmissionFormPage.getTitleField().should('have.value', data.description)
      SubmissionFormPage.clickSubmitResearchAndWaitPageLoadElife()
      ManuscriptsPage.getOptionsElifeText('Evaluation').click()
      SubmissionFormPage.clickSubmitResearchAndWaitPageLoadElife()
      cy.intercept('/graphql').as('getResponse')
      ManuscriptsPage.getOptionsElifeText('Publish').click()
      cy.wait('@getResponse').its('response').should('deep.include', {
        statusCode: 200,
        statusMessage: 'OK',
      })
      // Status is always PUBLISHED ???
      // SubmissionFormPage.waitThreeSec()
      ManuscriptsPage.getStatusField(0).contains('Published')
    })
  })
})
