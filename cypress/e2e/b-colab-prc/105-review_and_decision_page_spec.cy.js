/* eslint-disable promise/always-return */

// import { beforeEach } from 'mocha'
import { dashboard, manuscripts } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ReviewPage } from '../../page-object/review-page'

describe('review page tests', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)
    cy.request('POST', `${seedUrl}/senior_editor_assigned`)
  })

  it("reviewer should see admin's decision after submitting a positive review", () => {
    cy.fixture('role_names').then(name => {
      const reviewer = name.role.reviewers[0]
      cy.addReviewer(0)

      cy.login(reviewer, dashboard)
      cy.submitReview('accept', 'everything is ok', 'great submission!')

      cy.login(name.role.admin, manuscripts)
      cy.submitDecision('great paper!', 'accept')

      cy.login(reviewer, dashboard)
      cy.verifyDecision('great paper')
    })
  })

  it("reviewer should see admin's decision after submitting a neutral review", () => {
    cy.fixture('role_names').then(name => {
      const reviewer = name.role.reviewers[1]
      cy.addReviewer(1)

      cy.login(reviewer, dashboard)
      cy.submitReview('revise', 'everything is ok', 'paper should be revised')

      cy.login(name.role.admin, manuscripts)
      cy.submitDecision('please revise', 'revise')

      cy.login(reviewer, dashboard)
      cy.verifyDecision('please revise')
    })
  })

  it("reviewer should see admin's decision after submitting a negative review", () => {
    cy.fixture('role_names').then(name => {
      const reviewer = name.role.reviewers[3]
      cy.addReviewer(3)
      cy.login(reviewer, dashboard)
      cy.submitReview('reject', 'everything is ok', 'not good enough')

      cy.login(name.role.admin, manuscripts)
      cy.submitDecision('it does not fit our standards', 'reject')

      cy.login(reviewer, dashboard)
      cy.verifyDecision('it does not fit our standards')
    })
  })
})

Cypress.Commands.add('addReviewer', reviewerIndex => {
  cy.fixture('role_names').then(name => {
    const reviewer = name.role.reviewers[`${reviewerIndex}`]
    // login as seniorEditor

    cy.login(name.role.seniorEditor, dashboard)
    cy.url().should('include', '/dashboard')

    DashboardPage.clickDashboardTab(2)
    DashboardPage.clickControl() // Navigate to Control Page
    cy.url().should('include', '/prc/versions')
    cy.contains('Team').should('exist')

    ControlPage.clickInviteReviewerDropdown()
    ControlPage.inviteReviewer(reviewer)

    // Ensure modal closes before continuing
    cy.get('[data-testid=submit-modal]', { timeout: 10000 }).should('not.exist')

    // Confirm reviewer label shows up in the DOM
    cy.contains(reviewer, { timeout: 60000 }).should('exist')
  })
})

Cypress.Commands.add(
  'submitReview',
  (reviewType, comment, confidentialComment) => {
    DashboardPage.clickDashboardTab(1)
    DashboardPage.clickAcceptReviewButton()
    cy.contains('button', 'Do Review').should('be.visible')
    DashboardPage.clickDoReviewAndVerifyPageLoaded()
    cy.contains('div', 'Metadata').should('be.visible')

    cy.get('[class*=HiddenTabs__Tab]').contains('Review').invoke('click')
    ReviewPage.fillInReviewComment(comment)
    ReviewPage.fillInConfidentialComment(confidentialComment)

    if (reviewType === 'accept') {
      ReviewPage.clickAcceptRadioButton()
    } else if (reviewType === 'revise') {
      ReviewPage.clickReviseRadioButton()
    } else if (reviewType === 'reject') {
      ReviewPage.clickRejectRadioButton()
    }

    ReviewPage.clickSubmitButton()
    ReviewPage.clickConfirmSubmitButton()
    cy.awaitDisappearSpinner()
  },
)

Cypress.Commands.add('submitDecision', (decisionText, decisionAction) => {
  cy.awaitDisappearSpinner()
  ManuscriptsPage.selectOptionWithText('Control')
  ControlPage.clickDecisionTab(1)
  ControlPage.fillInDecision(decisionText)

  if (decisionAction === 'revise') {
    ReviewPage.clickReviseRadioButton()
  } else if (decisionAction === 'accept') {
    ReviewPage.clickAcceptRadioButton()
  } else if (decisionAction === 'reject') {
    ReviewPage.clickRejectRadioButton()
  }

  ControlPage.clickSubmit()
})

Cypress.Commands.add('verifyDecision', expectedDecisionText => {
  DashboardPage.clickCompletedReviewButton()
  cy.awaitDisappearSpinner()
  cy.get('[class*=HiddenTabs__Tab]').contains('Decision').click()
  ReviewPage.getAllSectionHeaders()
    .eq(-1)
    .should('contain', 'Decision')
    .and('be.visible')
  ReviewPage.getDecisionText().should('contain', expectedDecisionText)
})
