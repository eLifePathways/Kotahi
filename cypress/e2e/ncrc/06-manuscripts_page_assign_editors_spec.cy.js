/* eslint-disable promise/always-return */

import { dashboard, manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'

describe.skip('manuscripts page assign editors tests', () => {
  beforeEach(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedFormsUrl = Cypress.config('seedFormsUrl')

    cy.request('POST', `${restoreUrl}/initial_state_other`)
    cy.request('POST', seedFormsUrl)

    // login as admin

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    ManuscriptsPage.clickSubmit()
    NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    SubmissionFormPage.fillInTitle('123')
    SubmissionFormPage.waitThreeSec()
    Menu.clickManuscriptsAndAssertPageLoad()
  })

  it('assign editors dropdown are visible, and are selected editors', () => {
    ManuscriptsPage.clickEvaluation()
    cy.url().should('contain', 'evaluation')
    cy.awaitDisappearSpinner()
    SubmissionFormPage.getAssignEditor(0).should(
      'contain',
      'Assign Senior Editor…',
    )

    cy.fixture('role_names').then(name => {
      SubmissionFormPage.getAssignEditor(0).click()
      SubmissionFormPage.selectDropdownOption(0)
      SubmissionFormPage.waitThreeSec()
      SubmissionFormPage.getAssignEditor(0).should(
        'contain',
        name.role.reviewers[2],
      )
      SubmissionFormPage.getAssignEditor(1).should(
        'contain',
        'Assign Handling Editor…',
      )
      SubmissionFormPage.getAssignEditor(1).click()
      SubmissionFormPage.selectDropdownOption(0)
      SubmissionFormPage.waitThreeSec()
      SubmissionFormPage.getAssignEditor(1).should(
        'contain',
        name.role.reviewers[2],
      )
    })
  })

  it('check all three editor names appears in the table', () => {
    cy.fixture('role_names').then(name => {
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      cy.awaitDisappearSpinner()
      SubmissionFormPage.getAssignEditor(0).click()
      SubmissionFormPage.selectDropdownOptionWithText(name.role.reviewers[0])
      SubmissionFormPage.getAssignEditor(1).click()
      SubmissionFormPage.selectDropdownOptionWithText(name.role.reviewers[1])
      SubmissionFormPage.getAssignEditor(2).click()
      SubmissionFormPage.selectDropdownOptionWithText(name.role.reviewers[2])
      Menu.clickManuscriptsAndAssertPageLoad()
      cy.awaitDisappearSpinner()
      ManuscriptsPage.getEditorName()
        .eq(-3)
        .scrollIntoView()
        .should('contain', name.role.reviewers[0])
      ManuscriptsPage.getEditorName()
        .eq(-2)
        .scrollIntoView()
        .should('contain', name.role.reviewers[1])
      ManuscriptsPage.getEditorName()
        .eq(-1)
        .scrollIntoView()
        .should('contain', name.role.reviewers[2])
    })
  })
  it('assign senior editor only', () => {
    cy.fixture('role_names').then(name => {
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      cy.awaitDisappearSpinner()
      SubmissionFormPage.getAssignEditor(0).click()
      SubmissionFormPage.selectDropdownOptionWithText(name.role.reviewers[2])
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getEditorName()
        .eq(-1)
        .scrollIntoView()
        .should('contain', name.role.reviewers[2])
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      SubmissionFormPage.getAssignEditor(0).should(
        'contain',
        name.role.reviewers[2],
      )
      SubmissionFormPage.getAssignEditor(1).should(
        'contain',
        'Assign Handling Editor…',
      )
      SubmissionFormPage.getAssignEditor(2).should('contain', 'Assign Editor…')
    })
  })
  it('assign first handling editor only', () => {
    cy.fixture('role_names').then(name => {
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      cy.awaitDisappearSpinner()
      SubmissionFormPage.getAssignEditor(1).click()
      SubmissionFormPage.selectDropdownOptionWithText(name.role.reviewers[0])
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getEditorName()
        .eq(-1)
        .scrollIntoView()
        .should('contain', name.role.reviewers[0])
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      SubmissionFormPage.getAssignEditor(0).should(
        'contain',
        'Assign Senior Editor…',
      )
      SubmissionFormPage.getAssignEditor(1).should(
        'contain',
        name.role.reviewers[0],
      )
      SubmissionFormPage.getAssignEditor(2).should('contain', 'Assign Editor…')
    })
  })
  it('assign second handling editor only', () => {
    cy.fixture('role_names').then(name => {
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      cy.awaitDisappearSpinner()
      SubmissionFormPage.getAssignEditor(2).click()
      SubmissionFormPage.selectDropdownOptionWithText(name.role.reviewers[0])
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getEditorName()
        .eq(-1)
        .scrollIntoView()
        .should('contain', name.role.reviewers[0])
      ManuscriptsPage.clickEvaluationAndVerifyUrl()
      SubmissionFormPage.getAssignEditor(0).should(
        'contain',
        'Assign Senior Editor…',
      )
      SubmissionFormPage.getAssignEditor(1).should(
        'contain',
        'Assign Handling Editor…',
      )
      SubmissionFormPage.getAssignEditor(2).should(
        'contain',
        name.role.reviewers[0],
      )
    })
  })
  // to be implemented in #489
  it('editor should see article title in dashboard', () => {
    ManuscriptsPage.clickEvaluation()
    cy.url().should('contain', 'evaluation')
    cy.awaitDisappearSpinner()
    cy.fixture('role_names').then(name => {
      SubmissionFormPage.getAssignEditor(0).click()
      SubmissionFormPage.selectDropdownOption(0)
      SubmissionFormPage.waitThreeSec()
      SubmissionFormPage.getAssignEditor(0).should(
        'contain',
        name.role.reviewers[2],
      )
      cy.login(name.role.reviewers[2], dashboard)
      DashboardPage.getVersionTitle().should('contain', '123')
    })
  })
})
