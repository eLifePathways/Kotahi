/* eslint-disable promise/always-return */

import roles from '../../fixtures/role_names'
import { ControlPage } from '../../page-object/control-page'
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'

const { seniorEditor } = roles

describe('Editor assigning reviewers', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.bootstrap`)
    cy.request('POST', `${seedUrl}/senior_editor_assigned`)
  })

  it('can assign 6 reviewers', () => {
    // login as seniorEditor
    cy.login(seniorEditor, dashboard)
    cy.url().should('eq', `${Cypress.config().baseUrl}/journal/dashboard`)
    cy.reload()
    cy.awaitDisappearSpinner()

    cy.fixture('role_names').then(name => {
      // login as seniorEditor
      cy.login(name.role.seniorEditor, dashboard)
      cy.reload()
      DashboardPage.clickDashboardTab(2)
      cy.contains('h2', 'Editing Queue').should('exist') // waiting for the page to load
      DashboardPage.clickControl() // Navigate to Control Page

      // Invite all the reviewers
      cy.reload()
      name.role.reviewers.forEach(reviewer => {
        ControlPage.clickInviteReviewerDropdown()
        ControlPage.inviteReviewer(reviewer)
        // Ensure modal closes before continuing
        cy.get('[data-testid=submit-modal]', { timeout: 10000 }).should(
          'not.exist',
        )

        // Confirm reviewer label shows up in the DOM
        cy.contains(reviewer, { timeout: 60000 }).should('exist')
        // ControlPage.getNumberOfInvitedReviewers().should('eq', index + 1)
      })
    })

    // Go to dashboard and verify number of invited reviewer
    Menu.clickDashboard()
    cy.get('.ReviewStatusDonut__CenterLabel-sc-76zxfe-1').contains('6')
  })
})
