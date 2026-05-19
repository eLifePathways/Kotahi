/* eslint-disable promise/always-return */

import { Menu } from '../../page-object/page-component/menu'
import { LoginPage } from '../../page-object/login-page'
import { manuscripts, login } from '../../support/routes2'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

describe('Login page tests', () => {
  before(() => {
    cy.fixture('branding_settings').then(() => {
      const restoreUrl = Cypress.config('restoreUrl')
      cy.request('POST', `${restoreUrl}/commons.elife_bootstrap`)
    })
  })

  it('page should display eLife branding settings', () => {
    cy.fixture('branding_settings').then(settings => {
      cy.visit(login)

      LoginPage.getBackground().should('be.visible')
      LoginPage.getLogo().should('be.visible')
      LoginPage.getLoginButton().should('be.visible')
      // assert settings are specific to eLife instance
      LoginPage.getBackground()
        .should('have.css', 'background-image')
        .and('contains', settings.preprint1.primaryColor)
      LoginPage.getLogo()
        .should('have.attr', 'alt')
        .and('eq', settings.preprint1.brandName)
      LoginPage.getLogo()
        .should('have.attr', 'src')
        .and('eq', settings.preprint1.logoPath)
      LoginPage.getLoginButton()
        .should('have.css', 'background-color')
        .and('contains', settings.preprint1.secondaryColor)
    })
  })

  context(
    'admin can see branding settings, and verifies the pages in the menu',
    () => {
      // before(() => {
      //   cy.fixture('branding_settings').then(settings => {
      //     const restoreUrl = Cypress.config('restoreUrl')
      //     cy.request('POST', `${restoreUrl}/commons.elife_bootstrap`)
      //   })
      // })

      beforeEach(() => {
        // login as admin
        cy.fixture('role_names').then(name => {
          cy.login(name.role.admin, manuscripts)
        })
      })

      it('branding settings should be visible after login', () => {
        // // eslint-disable-next-line jest/valid-expect-in-promise
        cy.fixture('branding_settings').then(settings => {
          cy.awaitDisappearSpinner()
          Menu.getBackground()
            .should('have.css', 'background')
            .and('contains', settings.preprint1.primaryColor)
          ManuscriptsPage.getSubmitButton()
            .should('have.css', 'background-color')
            .should('contain', settings.preprint1.tertiaryColor)
        })
      })

      it('dashboard page should not be visible to the logged in user', () => {
        cy.awaitDisappearSpinner()
        Menu.getDashboardButton().should('not.exist')
      })

      it('Manuscripts, Reports and Settings page should be visible to the logged in user', () => {
        cy.awaitDisappearSpinner()
        Menu.getManuscriptsButton().should('be.visible')
        Menu.getReportsButton().should('be.visible')
        Menu.getSettingsButton().click()
        Menu.getFormsButton().should('be.visible')
        Menu.getUsersButton().should('be.visible')
      })
    },
  )
})
