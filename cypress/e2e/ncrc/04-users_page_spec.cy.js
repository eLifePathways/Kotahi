/* eslint-disable promise/always-return, promise/catch-or-return */

/// <reference types="Cypress" />
import {
  users,
  dashboard,
  formBuilder,
  manuscripts,
} from '../../support/routes'
import { UsersPage } from '../../page-object/users-page'
import { Menu } from '../../page-object/page-component/menu'
import { FormsPage } from '../../page-object/forms-page'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

describe.skip('users page tests', () => {
  beforeEach(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedFormsUrl = Cypress.config('seedFormsUrl')

    cy.request('POST', `${restoreUrl}/initial_state_other`)
    cy.request('POST', seedFormsUrl)

    // login as admin
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, users)
    })
    cy.awaitDisappearSpinner()
  })

  context('visibility check', () => {
    it('button to switch user roles should be visible', () => {
      UsersPage.getRemoveGroupManagerRoleButton()
        .its('length')
        .then(length => {
          expect(length).to.be.eq(7)

          for (let i = 0; i < 7; i++) {
            UsersPage.getRemoveGroupManagerRoleButton()
              .eq(i)
              .scrollIntoView()
              .should('be.visible')
          }
        })
    })
  })

  context('functionality check', () => {
    it('normal user can be set to group manager', () => {
      cy.fixture('role_names').then(name => {
        UsersPage.getNthUserRow(0).should('contain', name.role.seniorEditor)
        UsersPage.getAddGroupManagerRoleButton()
          .eq(0)
          .should('contain', 'Make Group Manager')
          .click()
        UsersPage.getAdminStatusByRow(0).should('contain', 'yes')
        cy.login(name.role.seniorEditor, dashboard)
        cy.awaitDisappearSpinner()
        Menu.getFormsButton().should('be.visible')
        Menu.getManuscriptsButton().should('be.visible')
        Menu.getUsersButton().should('be.visible')

        Menu.clickForms()
        cy.awaitDisappearSpinner()
        FormsPage.getFormTitleTab(0).should('be.visible')
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.getTableHeader().should('be.visible')
        Menu.clickUsers()
        cy.awaitDisappearSpinner()
        UsersPage.getTitle().should('be.visible')
      })
    })
    it('group manager can be reverted to normal user', () => {
      cy.fixture('role_names').then(name => {
        UsersPage.getNthUserRow(1).should('contain', name.role.tester)
        UsersPage.getRemoveGroupManagerRoleButton()
          .eq(1)
          .should('contain', 'Remove Group Manager role')
          .click()
        UsersPage.getAdminStatusByRow(1).should('not.contain', 'yes')
        cy.login(name.role.tester, dashboard)
        cy.awaitDisappearSpinner()
        Menu.getFormsButton().should('not.exist')
        Menu.getManuscriptsButton().should('not.exist')
        Menu.getUsersButton().should('not.exist')

        cy.visit(users)
        cy.awaitDisappearSpinner()
        UsersPage.getTitle().should('not.exist')
        UsersPage.getDeleteButton().should('not.exist')
        cy.visit(formBuilder)
        cy.awaitDisappearSpinner()
        FormsPage.getFormOptionList().should('not.exist')
        cy.visit(manuscripts)
        cy.awaitDisappearSpinner()
        ManuscriptsPage.getTableHeader().should('not.exist')
        ManuscriptsPage.getLiveChatButton().should('not.exist')
      })
    })
  })
})
