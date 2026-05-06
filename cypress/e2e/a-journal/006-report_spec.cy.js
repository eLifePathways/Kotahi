/* eslint-disable promise/always-return, promise/catch-or-return, promise/no-nesting */

import { dashboard } from '../../support/routes'
import { Menu } from '../../page-object/page-component/menu'
import { ReportPage, REVIEWER_COLUMNS } from '../../page-object/reports-page'

describe('Report Page', () => {
  it('Admin views and interacts with the reports page', () => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.bootstrap`)
    cy.request('POST', `${seedUrl}/three_reviews_completed`)

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })

    /* Group Manager can access the Reports */
    Menu.getReportsButton().should('be.visible')
    Menu.clickReports()

    /* Apply date range filter */
    ReportPage.getFromDateInput(1).clear().type('2021')
    ReportPage.getFromDateInput(2).clear().type('07')
    ReportPage.getFromDateInput(3).clear().type('01')

    /* Select and View each report table from the dropdown menu */
    ReportPage.getReportTypeDropDown().select('Editor') // Open Editor Report Page
    ReportPage.getReportTypeDropDown().select('Author') // Open Author Report Page
    ReportPage.getReportTypeDropDown().select('Manuscript') // Manuscript Report Page

    /* Manusripts Table > Reviewers column */
    ReportPage.getReviewerRecords().should('have.length', 6) // Total Reviews: 6
    ReportPage.getCompletedSvg().should('have.length', 3) // Completed Reviews: 3
    ReportPage.getInvitedSvg().should('have.length', 1) // Invited Reviewers: 1
    ReportPage.getRejectedSvg().should('have.length', 1) // Rejected Invitation: 1
    ReportPage.getAcceptedSvg().should('have.length', 1) // Accepted Invitation: 1

    /* Reviewer Report Page */
    ReportPage.getReportTypeDropDown().select('Reviewer')

    // TO-DO: The features: recommendedToAccept, recommendedToRevise,
    // and recommendedToReject are not included since htey do not work in the app

    cy.fixture('report_data').then(({ reviewersData }) => {
      reviewersData.forEach(reviewer => {
        const {
          reviewerName,
          reviewInvites,
          invitesDeclined,
          reviewsCompleted,
          averageReviewDuration,
        } = reviewer

        ReportPage.getReviewerRowByName(reviewerName)
          .find('[data-testid="cell"]')
          .then(cells => {
            // cells is now a jQuery collection

            cy.wrap(cells)
              .eq(REVIEWER_COLUMNS.INVITES)
              .find('[data-testid="cell-value"]')
              .should('have.text', reviewInvites)

            cy.wrap(cells)
              .eq(REVIEWER_COLUMNS.DECLINED)
              .find('[data-testid="cell-value"]')
              .should('have.text', invitesDeclined)

            cy.wrap(cells)
              .eq(REVIEWER_COLUMNS.COMPLETED)
              .find('[data-testid="cell-value"]')
              .should('have.text', reviewsCompleted)

            cy.wrap(cells)
              .eq(REVIEWER_COLUMNS.DURATION)
              .should('contain.text', averageReviewDuration)
          })
      })
    })
  })
})
