/* eslint-disable promise/always-return */

import {
  dashboard,
  profile,
  manuscripts,
  users,
  formBuilder,
} from '../../support/routes1'
import { ProfilePage } from '../../page-object/profile-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('profile page tests', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)
  })
  beforeEach(() => {
    // login and attempt to access the dashboard page
    cy.fixture('role_names').then(name => {
      cy.login(name.role.tester, profile)
    })
    cy.awaitDisappearSpinner()
  })
  it('first login - users should be asked to add their email', () => {
    ProfilePage.getPopupEmailField().should('exist').and('be.visible')
  })
  it('first login - users should not be able to switch pages before adding email', () => {
    ProfilePage.getPopupEmailField().should('exist').and('be.visible')
    cy.visit(dashboard)
    cy.awaitDisappearSpinner()
    cy.url().should('not.contain', dashboard).and('contain', profile)
    ProfilePage.getPopupEmailField().should('exist').and('be.visible')
    cy.visit(manuscripts)
    cy.awaitDisappearSpinner()
    cy.url().should('not.contain', manuscripts).and('contain', profile)
    ProfilePage.getPopupEmailField().should('exist').and('be.visible')
    cy.visit(users)
    cy.awaitDisappearSpinner()
    cy.url().should('not.contain', users).and('contain', profile)
    ProfilePage.getPopupEmailField().should('exist').and('be.visible')
    cy.visit(formBuilder)
    cy.awaitDisappearSpinner()
    cy.url().should('not.contain', formBuilder).and('contain', profile)
    ProfilePage.getPopupEmailField().should('exist').and('be.visible')
  })
  it('first login - validate email', () => {
    ProfilePage.updateEmailInPopup('test')
    ProfilePage.clickPopupNextButton()
    ProfilePage.getPopupEmailError().should('be.visible')
    ProfilePage.getPopupEmailError().should('contain', 'invalid')
    ProfilePage.updateEmailInPopup('123')
    ProfilePage.clickPopupNextButton()
    ProfilePage.getPopupEmailError().should('be.visible')
    ProfilePage.getPopupEmailError().should('contain', 'invalid')
    ProfilePage.updateEmailInPopup('email@')
    ProfilePage.clickPopupNextButton()
    ProfilePage.getPopupEmailError().should('be.visible')
    ProfilePage.getPopupEmailError().should('contain', 'invalid')
  })
  it('first login - after adding email user can navigate away', () => {
    ProfilePage.updateEmailInPopup('test@email.com')
    ProfilePage.clickPopupNextButton()
    ProfilePage.getEmailChangeError().should('not.exist')
    cy.visit(dashboard)
    cy.awaitDisappearSpinner()
    DashboardPage.getHeader().should('be.visible')
    Menu.clickFormsAndVerifyPageLoaded()
    Menu.clickUsersAndVerifyPageLoaded()
    Menu.clickManuscriptsAndAssertPageLoad()
  })
})
