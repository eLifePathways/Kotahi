/* eslint-disable promise/always-return */

import { Menu } from '../../page-object/page-component/menu'
import { dashboard, manuscripts, login } from '../../support/routes3'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { LoginPage } from '../../page-object/login-page'

describe('Login page tests', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/initial_state_other`)
  })

  it('checking Kotahi branding in the login page', () => {
    cy.fixture('branding_settings').then(settings => {
      cy.visit(login)

      LoginPage.getBackground().should('be.visible')
      LoginPage.getLogo().should('be.visible')
      LoginPage.getLoginButton().should('be.visible')
      // assert settings are specific to eLife instance
      LoginPage.getBackground().should('have.css', 'background-image')
      // .and('contains', settings.preprint2.primaryColor)
      LoginPage.getLogo()
        .should('have.attr', 'alt')
        .and('eq', settings.preprint2.brandName)
      LoginPage.getLogo()
        .should('have.attr', 'src')
        .and('eq', settings.preprint2.logoPath)
      LoginPage.getLoginButton().should('have.css', 'background-color')
      // .and('contains', settings.preprint2.primaryColor)
    })
  })

  context('other users can only access the Dashboard page', () => {
    beforeEach(() => {
      // login as a reviewer
      cy.fixture('role_names').then(name => {
        cy.login(name.role.reviewers[0], dashboard)
      })
      cy.awaitDisappearSpinner()
    })

    it('Reviewer/Editor cannot access the admin-specific pages', () => {
      Menu.getFormsButton().should('not.exist')
      Menu.getUsersButton().should('not.exist')
      Menu.assertManuscriptsButtonDoesNotExist()
      Menu.getMyProfileButton().should('be.visible')
      cy.visit(manuscripts)
      cy.contains('403').should('exist')
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHeader().should('not.exist')
    })
  })
})
