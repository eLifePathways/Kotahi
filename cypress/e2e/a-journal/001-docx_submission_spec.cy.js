/* eslint-disable promise/always-return */

import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes'

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

    DashboardPage.clickSubmissionButton() // Click on new submission
  })

  it('can upload a manuscript and add a title', () => {
    DashboardPage.getSubmissionFileUploadInput().selectFile(
      'cypress/fixtures/test-docx.docx',
      { force: true },
    ) // Upload manuscript .docx
    DashboardPage.confirmSubmissionCreated()
    cy.url().should('contain', '/submit')

    cy.completeSubmissionForm('Title 1')
  })

  it('can submit a URL and add a title', () => {
    // Submit a URL
    cy.get('button').contains('Submit a URL instead').click()

    cy.completeSubmissionForm('Title 2')
  })

  it('can upload a PDF and add a title', () => {
    // Upload manuscript .pdf
    DashboardPage.getSubmissionFileUploadInput().selectFile(
      'cypress/fixtures/test-pdf.pdf',
      { force: true },
    )
    DashboardPage.confirmSubmissionCreated()
    cy.url().should('contain', '/submit')

    cy.completeSubmissionForm('Title 3')
  })
})

Cypress.Commands.add('completeSubmissionForm', title => {
  SubmissionFormPage.fillInField('submission.$title', title, true)
  SubmissionFormPage.clickSubmitResearch()

  // Submit your manuscript
  SubmissionFormPage.clickSubmitYourManuscript()

  // Verify your submission exists in dashboard
  DashboardPage.getSectionTitleWithText('My Submissions')
  // the following line is added so that it gives enough time for the dom to update the title of the submission in dashboard. Only a switch between tabs.
  DashboardPage.clickDashboardTab(1)
  DashboardPage.clickDashboardTab(0)
  DashboardPage.getSubmissionTitle().should('contain', title)
})
