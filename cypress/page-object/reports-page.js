const REPORT_OPTIONS = 'report-options'
const DATE_INPUT = ' [data-testid="report-options"] input'

/* Report Icons */
const COMPLETED_SVG = 'completed-svg'
const INVITED_SVG = 'invited-svg'
const ACCEPTED_SVG = 'accepted-svg'
const REJECTED_SVG = 'rejected-svg'

const REVIEWER_RECORD = 'reviewer-record'
const ROW = 'row'

export const REVIEWER_COLUMNS = {
  NAME: 0,
  INVITES: 1,
  DECLINED: 2,
  COMPLETED: 3,
  DURATION: 4,
}

export const ReportPage = {
  getReportActions() {
    return cy.getByDataTestId(REPORT_OPTIONS)
  },
  getReportTypeDropDown() {
    return this.getReportActions().children('select')
  },
  getFromDateInput(nth) {
    return cy.get(DATE_INPUT).eq(nth)
  },
  getToDateInput(nth) {
    return cy.get(DATE_INPUT).eq(nth + 4)
  },
  /* Manuscript Type */
  getCompletedSvg() {
    return cy.getByDataTestId(COMPLETED_SVG)
  },
  getInvitedSvg() {
    return cy.getByDataTestId(INVITED_SVG)
  },
  getAcceptedSvg() {
    return cy.getByDataTestId(ACCEPTED_SVG)
  },
  getRejectedSvg() {
    return cy.getByDataTestId(REJECTED_SVG)
  },
  getReviewerRecords() {
    return cy.getByDataTestId(REVIEWER_RECORD)
  },
  getRow(nth) {
    return cy.getByDataTestId(ROW).eq(nth)
  },
  getColumnData(row, col) {
    return this.getRow(row).find('[data-testid="cell-value"]').eq(col)
  },
  /* Review Type */
  // getReviewerName(row) {
  //   return this.getRow(row).children().eq(0)
  // },
  // getReviewInvites(row) {
  //   return this.getColumnData(row, 0)
  // },
  // getInvitesDeclined(row) {
  //   return this.getColumnData(row, 1)
  // },
  // getReviewsCompleted(row) {
  //   return this.getColumnData(row, 2)
  // },
  // getAverageReviewDuration(row) {
  //   return this.getColumnData(row, 3)
  // },
  // getRecommendedToAccept(row) {
  //   return this.getColumnData(row, 4)
  // },
  // getRecommendedToRevise(row) {
  //   return this.getColumnData(row, 5)
  // },
  // getRecommendedToReject(row) {
  //   return this.getColumnData(row, 6)
  // },

  getReviewerRowByName(name) {
    return cy
      .contains('[data-testid="cell"]', name)
      .should('be.visible')
      .closest('[data-testid="row"]')
  },

  getCells(row) {
    return cy.wrap(row).find('[data-testid="cell"]')
  },

  getCellValue(cell) {
    return cy.wrap(cell).find('[data-testid="cell-value"]')
  },
}
