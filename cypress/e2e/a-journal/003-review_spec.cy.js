/* eslint-disable promise/always-return */

import { DashboardPage } from '../../page-object/dashboard-page'
import { ReviewPage } from '../../page-object/review-page'
import { dashboard } from '../../support/routes'

const reviewDataList = [
  {
    verdict: 'accept',
    comment: 'The paper looks good to me overall!',
    radioButton: 'accept',
  },
  {
    verdict: 'accept',
    comment: 'The article has a time-lag bias',
    radioButton: 'reject',
  },
  {
    verdict: 'reject',
  },
  {
    verdict: 'accept',
  },
  {
    verdict: 'accept',
    comment: 'Please use a linear scale.',
    radioButton: 'revise',
  },
]

describe('Completing reviews', () => {
  it('Reviewing -- accepting and rejecting', () => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.bootstrap`)
    cy.request('POST', `${seedUrl}/reviewers_invited`)

    cy.fixture('role_names').then(name => {
      // Reviewers
      doReview(name.role.reviewers[0], reviewDataList[0])
      doReview(name.role.reviewers[1], reviewDataList[1])
      doReview(name.role.reviewers[2], reviewDataList[2])
      doReview(name.role.reviewers[3], reviewDataList[3])
      doReview(name.role.reviewers[4], reviewDataList[4])

      // login as seniorEditor and assign the 3 reviews are completed
      cy.login(name.role.seniorEditor, dashboard)

      DashboardPage.clickDashboardTab(2)
      cy.get('[fill="#56b984"]')
        .should('be.visible')
        .trigger('mouseover', { force: true })
      cy.contains('Completed: 3')
      cy.get('[fill="#fff2cd"]').should('be.visible').trigger('mouseover')
      cy.contains('Invited: 1')
      cy.get('[fill="#d7efd4"]').should('be.visible').trigger('mouseover')
      cy.contains('Accepted: 1')

      cy.get('[fill="#c23d20"]').should('be.visible').trigger('mouseover')
      cy.contains('Declined: 1')

      cy.get('[data-testid="control-panel-team"]').click()
      cy.awaitDisappearSpinner()
      cy.get(
        '[class*=KanbanBoard__Kanban] > :nth-child(1) > [class*=KanbanBoard__CardsWrapper] > [class*=KanbanCard]',
      ).should('contain', name.role.reviewers[5])
      // ControlPage.getInvitedReviewer
      cy.get(
        '[class*=KanbanBoard__Kanban] > :nth-child(2) > [class*=KanbanBoard__CardsWrapper] > [class*=KanbanCard]',
      ).should('contain', name.role.reviewers[3])
      cy.get(
        '[class*=KanbanBoard__Kanban] > :nth-child(4) > [class*=KanbanBoard__CardsWrapper] > [class*=KanbanCard]',
      ).should('contain', name.role.reviewers[1])

      cy.contains('See Declined (1)').should('exist')
    })
  })
})

// login as reviewer, accept and do review, leave comments and submit
const doReview = (name, reviewData) => {
  cy.login(name, dashboard)
  cy.get('nav').contains('Dashboard').click()
  cy.visit(dashboard)
  DashboardPage.clickDashboardTab(1)

  // Accpet Review Request Workflow
  if (reviewData.verdict === 'accept') {
    DashboardPage.clickAcceptReviewButton()
    cy.contains('button', 'Do Review').should('exist')

    // Only do the review if there'a  comment present
    if (reviewData.comment) {
      // Do the Review
      DashboardPage.clickDoReview()
      cy.awaitDisappearSpinner()
      cy.contains('Type of Research Object').should('exist')
      cy.get('[class*=TabsContainer]').contains('Review').click()
      ReviewPage.getReviewCommentField().focus().type('comment', { delay: 200 })
      ReviewPage.getReviewCommentField().fillInput(reviewData.comment)
      if (reviewData.radioButton === 'accept')
        ReviewPage.clickAcceptRadioButton()
      if (reviewData.radioButton === 'reject')
        ReviewPage.clickRejectRadioButton()
      if (reviewData.radioButton === 'revise')
        ReviewPage.clickReviseRadioButton()

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000)

      // Submit the review
      ReviewPage.clickSubmitButton()
      cy.contains('Confirm your review').should('exist')
      ReviewPage.clickConfirmSubmitButton()

      // Verify the review got completed
      cy.get('nav').contains('Dashboard').click()
      DashboardPage.getDoReviewButton().should('contain', 'View')
      cy.get('[type="user"]:nth(1)').click()
      cy.contains('Logout').click()
    }
  }

  // Reject Review Request Workflow
  if (reviewData.verdict === 'reject') {
    DashboardPage.clickRejectReviewButton()
    DashboardPage.getDoReviewButton().should('not.exist')
    cy.get('[type="user"]:nth(1)').click()
    cy.contains('Logout').click()
  }
}
