/* eslint-disable promise/always-return */

import Color from 'color'
import { Menu } from '../../page-object/page-component/menu'
import { LoginPage } from '../../page-object/login-page'
import { manuscripts, login } from '../../support/routes1'

describe('Login page tests', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)
  })

  it('page should display prc branding settings', () => {
    cy.fixture('branding_settings').then(settings => {
      const primaryAsRgb = Color(settings.prc.primaryColor).string()

      cy.visit(login)

      LoginPage.getBackground().should('be.visible')
      LoginPage.getLogo().should('be.visible')
      LoginPage.getLoginButton().should('be.visible')
      // assert settings are specific to prc instance
      LoginPage.getBackground()
        .should('have.css', 'background-image')
        .and('contains', primaryAsRgb)
      LoginPage.getLogo()
        .should('have.attr', 'alt')
        .and('eq', settings.prc.brandName)
      LoginPage.getLogo()
        .should('have.attr', 'src')
        .and('eq', settings.prc.logoPath)
      LoginPage.getLoginButton()
        .should('have.css', 'background-color')
        .and('contains', primaryAsRgb)
    })
  })

  context('admin can see branding settings, dashboard and reports page', () => {
    beforeEach(() => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
    })

    it('branding settings should be visible after login', () => {
      cy.fixture('branding_settings').then(settings => {
        Menu.getBackground()
          .should('have.css', 'background')
          .and('contains', Color(settings.prc.primaryColor).string())
      })
    })

    it('Dashboard, Manuscripts, Reports and Settings page should be visible to the logged in user', () => {
      cy.awaitDisappearSpinner()
      Menu.getDashboardButton().should('be.visible')
      Menu.getManuscriptsButton().should('be.visible')
      Menu.getReportsButton().should('be.visible')
      Menu.getSettingsButton().click()
      Menu.getFormsButton().should('be.visible')
      Menu.getUsersButton().should('be.visible')
    })
  })
})
