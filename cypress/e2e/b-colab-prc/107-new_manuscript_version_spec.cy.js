/* eslint-disable promise/always-return, promise/no-nesting */

import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes1'

const decisionTextContent = 'Please fix Foo in the Paper!'
const decisionFileName = 'test-pdf.pdf'
const decisinFilePath = 'cypress/fixtures/test-pdf.pdf'

describe('checking manuscript version', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)
    cy.request('POST', `${seedUrl}/three_reviews_completed`)
  })

  it('editor checks for new manuscript version', () => {
    cy.fixture('role_names').then(name => {
      /* Editor  Submits a decision */
      cy.login(name.role.seniorEditor, dashboard)
      DashboardPage.clickDashboardTab(2)
      DashboardPage.clickControl() // Navigate to Control Page
      ControlPage.clickDecisionTab(1)
      /* Verify publish button is disabled */
      ControlPage.getPublishButton().should('be.disabled')
      /* Fill the decision form */
      ControlPage.clickDecisionTextInput()
      ControlPage.getDecisionTextInput().type(decisionTextContent)
      ControlPage.getDecisionFileInput().selectFile(decisinFilePath, {
        force: true,
      })
      cy.contains('test-pdf.pdf').should('exist')
      cy.contains('Decision Status').scrollIntoView()
      // ReviewPage.clickRevise()
      cy.get('[class*=FormTemplate__SafeRadioGroup]').eq(1).click()
      /* Submit the decision */
      ControlPage.clickSubmitDecisionButton()
      /* Check appears in front of button */
      ControlPage.checkSvgExists()

      /* View Decision as an Author */
      cy.login(name.role.author, dashboard)
      /* Click on first MySubmission */
      DashboardPage.getSubmittedManuscript().click()
      /* Verify Decision Content */
      DashboardPage.getDecisionField(0).should('contain', decisionTextContent)
      DashboardPage.getDecisionField(1).should('contain', decisionFileName)
      DashboardPage.getDecisionField(2).should('contain', 'Revise')
      /* Create new manuscript version */
      DashboardPage.clickCreateNewVersionButton()
      cy.contains('Edit submission info').should('exist')

      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInAbstractColab(data.abstract)
        SubmissionFormPage.getWaxInputBox(0).fillInput(data.abstract)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInPreprintUri(data.doi)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInKeywords(data.keywords)
        SubmissionFormPage.fillInReviewCreator(data.creator)
      })
      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.clickSubmitYourManuscript()
      /* Verify new submission got created */
      DashboardPage.getSubmittedManuscript()
        .contains('test pdf')
        .should('exist')

      /* Login as editor and check the new version submission form */
      cy.login(name.role.seniorEditor, dashboard)
      DashboardPage.clickDashboardTab(2)
      DashboardPage.clickControl() // Navigate to Control Page
      ControlPage.clickDecisionTab(1)
      /* Verify publish button is disabled */
      ControlPage.getPublishButton().should('be.disabled')
    })
  })
})
