/* eslint-disable promise/always-return */
/* eslint-disable cypress/unsafe-to-chain-command */

import { FormsPage } from '../../page-object/forms-page'
// import { Menu } from '../../page-object/page-component/menu'
import { submissionForm } from '../../support/routes2'

describe('Form builder', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.elife_bootstrap`)
  })

  beforeEach(() => {
    // login as admin
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, submissionForm)
    })
    FormsPage.verifyPageLoaded()
  })
  context('check Form builder elements visibility', () => {
    it('check elements from form builder', () => {
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

        for (let i = 0; i < 16; i++) {
          FormsPage.getFormBuilderElementName(i).should(
            'contain',
            formElements[i],
          )
        }
      })
    })

    // check the type of the field and if is required
    it('check form fields type and if are required', () => {
      FormsPage.verifyPageLoaded()
      const requiredField = 'Required'

      const typeField = [
        'Text',
        'DOI',
        'Manuscript source URI',
        'Title',
        'Rich text',
        'Text',
        'Text',
        'Rich text',
        'Text',
        'Text',
        'Rich text',
        'Text',
        'Text',
        'Rich text',
        'Text',
        'Text',
      ]

      for (let i = 0; i < 16; i++) {
        FormsPage.clickFormOption(i)
        cy.getByDataTestId('fieldType').should('contain', typeField[i])

        if (i < 4) {
          FormsPage.getFieldValidate().should('contain', requiredField)
        } else if (i >= 5) {
          FormsPage.getFieldValidate().should('not.contain', requiredField)
        }

        cy.contains('Cancel').click()
      }
    })

    it('check DOI validation has default selected Yes and select No', () => {
      FormsPage.clickFormOption(1)
      FormsPage.getDoiValidation(0).should('have.prop', 'checked')
      FormsPage.clickOptionsDoiVaildation(1)
      FormsPage.getDoiValidation(1).should('have.prop', 'checked')
      cy.contains('Cancel').click()
    })
  })

  context('add field to submission, review and decision forms', () => {
    it('viewing and adding fields in Submission, Review and Decision forms', () => {
      // For Submission Form
      FormsPage.getFormTitleTab(0).should('contain', 'eLife Submission Form')
      FormsPage.clickFormOption(1)
      FormsPage.getFieldValidate().click()
      cy.get('[class*="react-select__multi-value"]').eq(0).click()
      cy.contains('Save').click()
      // adding a field in submission form
      cy.get('[title="Add a field..."]').click({ force: true })
      cy.getByDataTestId('fieldType').click()
      cy.contains('Single image attachment').scrollIntoView().click()
      cy.contains('Save').click()

      // For Review Form
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

      // For Decision Form
      cy.contains('Decision').click()
      FormsPage.getFormTitleTab(0).should('contain', 'Decision')
      FormsPage.clickFormOption(1)
      FormsPage.getNameField().should('have.value', 'files').clear()
      FormsPage.getNameField().type('files')
      cy.contains('Save').click()
      // adding a field in decision form
      cy.get('[title="Add a field..."]').click({ force: true })
      cy.get('[data-testid="fieldType"]').click()
      cy.get('[class*="react-select__option"]')
        .contains('Rich text')
        .scrollIntoView()
        .click()
      FormsPage.getNameField().click().type('newField')
      cy.contains('Save').click()
    })
  })
})
