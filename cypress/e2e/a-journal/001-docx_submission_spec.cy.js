/* eslint-disable promise/always-return */
/* eslint-disable cypress/no-unnecessary-waiting */

import { DashboardPage } from '../../page-object/dashboard-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard, dashboardSubmissions } from '../../support/routes'

describe('Create a new submission', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.bootstrap`)
  })

  beforeEach(() => {
    // login as author
    cy.fixture('role_names').then(name => {
      cy.login(name.role.author, dashboard)
    })

    cy.wait(1000)
    DashboardPage.clickSubmissionButton() // Click on new submission
    cy.url().should('include', 'newSubmission')
  })

  it('can upload a manuscript, complete the form and see it on the dashboard', () => {
    NewSubmissionPage.uploadManuscript('cypress/fixtures/test-docx.docx')
    cy.url({ timeout: 30000 }).should('contain', '/submit')

    cy.completeSubmissionForm('Title 1')
  })
})

Cypress.Commands.add('completeSubmissionForm', title => {
  SubmissionFormPage.fillInField('submission.$title', title, true)
  SubmissionFormPage.clickSubmitResearch()

  // Submit your manuscript
  SubmissionFormPage.clickSubmitYourManuscript()

  // Verify your submission exists in dashboard
  cy.url().should('match', /\/dashboard$/)
  cy.visit(dashboardSubmissions)
  DashboardPage.getSubmissionTitle().should('contain', title)
})
