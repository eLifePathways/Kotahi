/* eslint-disable promise/always-return */

import { Menu } from '../../page-object/page-component/menu'
import { dashboard, manuscripts, login } from '../../support/routes3'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { DashboardPage } from '../../page-object/dashboard-page'
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

  context('admin can access all the pages', () => {
    beforeEach(() => {
      cy.fixture('role_names').then(name => {
        // login as admin
        cy.login(name.role.admin, dashboard)
      })
      cy.awaitDisappearSpinner()
    })
    it('"Editing Queue" is the only tab in dashboard page for admin', () => {
      Menu.getDashboardButton().should('be.visible')
      DashboardPage.getDashboardTab().should('contain', 'Editing Queue')
      DashboardPage.getDashboardTab().click()
      DashboardPage.getSectionTitleWithText('Editing Queue').should(
        'be.visible',
      )
    })

    it('Admin can access the reports, settings, forms, ursers and manuscripts', () => {
      Menu.getManuscriptsButton().should('be.visible')
      Menu.getReportsButton().should('be.visible')
      Menu.getSettingsButton().click()
      Menu.getFormsButton().should('be.visible')
      Menu.getUsersButton().should('be.visible')
      Menu.getReportsButton().should('be.visible')
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
    it('dashboard page is visible to the logged in user', () => {
      Menu.getDashboardButton().should('be.visible')
      DashboardPage.getDashboardTab().should('contain', 'Editing Queue')
      DashboardPage.getDashboardTab().click()
      DashboardPage.getSectionTitleWithText('Editing Queue').should(
        'be.visible',
      )
    })

    it('Reviewer/Editor cannot access the admin-specific pages', () => {
      Menu.getFormsButton().should('not.exist')
      Menu.getUsersButton().should('not.exist')
      Menu.getManuscriptsButton().should('not.exist')
      Menu.getMyProfileButton().should('be.visible')
      cy.visit(manuscripts)
      cy.contains('404 Page not found.').should('exist')
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getTableHeader().should('not.exist')
      ManuscriptsPage.getLiveChatButton().should('not.exist')
    })
  })
})
