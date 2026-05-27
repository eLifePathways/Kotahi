/* eslint-disable promise/always-return */

import { ControlPage } from '../../page-object/control-page'
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'

describe('Editor assigning reviewers', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.bootstrap`)
    cy.request('POST', `${seedUrl}/senior_editor_assigned`)
  })

  it('can assign 6 reviewers', () => {
    cy.fixture('role_names').then(name => {
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
    cy.getByDataTestId('donut-center-label').contains('6')
  })
})
