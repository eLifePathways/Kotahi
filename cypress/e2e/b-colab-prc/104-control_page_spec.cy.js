/* eslint-disable promise/always-return, promise/no-nesting */
/* eslint-disable cypress/no-unnecessary-waiting */

import { dashboard } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
// import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('control page tests', () => {
  // UPDATE 0.05.2025
  // SHARED checkbox can be clicked only on completed reviews
  // Also, I canot understand what Published publiclically mean

  // the commented part below is because of the issue for shared review that doesn't work as expected because of the issue #1011

  // context('shared message', () => {
  //   before(() => {
  //     cy.task('restore', 'initial_state_other')
  //     cy.task('seedForms')
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.admin, dashboard)
  //       cy.awaitDisappearSpinner()
  //       DashboardPage.clickSubmit()
  //       NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
  //       Menu.clickManuscriptsAndAssertPageLoad()
  //       ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //       ControlPage.clickAssignSeniorEditorDropdown()
  //       ControlPage.selectDropdownOptionByName(name.role.author)
  //       ControlPage.inviteReviewer(name.role.reviewers[3])
  //       ControlPage.inviteReviewer(name.role.reviewers[1])
  //       ControlPage.inviteReviewer(name.role.reviewers[4])
  //     })
  //   })
  //   it('shared message is visible', () => {
  //      // eslint-disable-next-line cypress/no-unnecessary-waiting
  //      cy.wait(500)
  //     ControlPage.clickInvitedReviewer()
  //     ControlPage.clickReviewerSharedCheckbox(0)
  //     ControlPage.clickReviewerSharedCheckbox(1)
  //     ControlPage.clickReviewerSharedCheckbox(2)
  //     ControlPage.waitThreeSec()
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.reviewers[3], dashboard)
  //       cy.awaitDisappearSpinner()
  //       DashboardPage.clickAcceptReviewButton()
  //       // eslint-disable-next-line cypress/no-unnecessary-waiting
  //       cy.wait(2000)
  //       DashboardPage.clickDoReviewAndVerifyPageLoaded()
  //       cy.fixture('submission_form_data').then(data => {
  //         ReviewPage.fillInReviewComment(data.review1)
  //       })
  //       ReviewPage.clickAcceptRadioButton()
  //       ReviewPage.clickSubmitButton()
  //       ReviewPage.clickConfirmSubmitButton()
  //       ReviewPage.waitThreeSec()
  //       cy.login(name.role.author, dashboard)
  //     })
  //     cy.awaitDisappearSpinner()
  //     cy.contains('Enter Email').click()
  //     cy.get('#enter-email').type('emilyaccount@test.com')
  //     cy.contains('Next').click()
  //     cy.visit('/kotahi/dashboard')
  //     ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //     DashboardPage.clickControlPanel()
  //     ControlPage.clickShow()
  //     cy.fixture('submission_form_data').then(data => {
  //       ControlPage.getReviewMessage().should('contain', data.review1)
  //     })
  //   })
  //   it('shared message is not visible', () => {
  //     ControlPage.waitThreeSec()
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.reviewers[1], dashboard)
  //       cy.awaitDisappearSpinner()
  //       cy.contains('Enter Email').click()
  //       cy.get('#enter-email').type('joane@test.com')
  //       cy.contains('Next').click()
  //       cy.visit('/kotahi/dashboard')
  //       DashboardPage.clickAcceptReviewButton()
  //       // eslint-disable-next-line cypress/no-unnecessary-waiting
  //       cy.wait(2000)
  //       DashboardPage.clickDoReviewAndVerifyPageLoaded()
  //       cy.fixture('submission_form_data').then(data => {
  //         ReviewPage.fillInReviewComment(data.review2)
  //       })
  //       ReviewPage.clickAcceptRadioButton()
  //       ReviewPage.clickSubmitButton()
  //       ReviewPage.clickConfirmSubmitButton()
  //       ReviewPage.waitThreeSec()
  //       cy.login(name.role.reviewers[0], dashboard)
  //     })
  //     cy.awaitDisappearSpinner()
  //     DashboardPage.clickControlPanel()
  //     cy.fixture('submission_form_data').then(data => {
  //       cy.get('.DecisionReview__Root-sc-1azvco7-6').should(
  //         'not.contain',
  //         data.review2,
  //       )
  //     })
  //   })

  /* commented because this is not visible yet on the reivew page" */
  //   it('checkbox can be published publicly is visible', () => {
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.admin, manuscripts)
  //     })
  //     ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //     ControlPage.clickInvitedReviewer()
  //     ControlPage.clickReviewerSharedCheckbox(0)
  //     ControlPage.waitThreeSec()
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.reviewers[4], dashboard)
  //     })
  //     cy.awaitDisappearSpinner()
  //     DashboardPage.clickAcceptReviewButton()
  //     DashboardPage.clickDoReviewAndVerifyPageLoaded()
  //     cy.fixture('submission_form_data').then(data => {
  //       ReviewPage.fillInReviewComment(data.review1)
  //     })
  //     ReviewPage.getCanBePublishedPubliclyCheckbox()
  //       .scrollIntoView()
  //       .should('be.visible')
  //     ReviewPage.clickCanBePublishedPublicly()
  //     ReviewPage.getCanBePublishedPubliclyCheckbox().should(
  //       'have.value',
  //       'true',
  //     )
  //   })
  //   it('icon for accepted to publish review is visible', () => {
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.admin, manuscripts)
  //     })
  //     ManuscriptsPage.clickControlAndVerifyPageLoaded()
  //     ControlPage.clickInvitedReviewer()
  //     ControlPage.clickReviewerSharedCheckbox(0)
  //     ControlPage.waitThreeSec()
  //     cy.fixture('role_names').then(name => {
  //       cy.login(name.role.reviewers[4], dashboard)
  //     })
  //     cy.awaitDisappearSpinner()
  //     DashboardPage.clickAcceptReviewButton()
  //     DashboardPage.clickDoReviewAndVerifyPageLoaded()
  //     cy.fixture('submission_form_data').then(data => {
  //       ReviewPage.fillInReviewComment(data.review1)
  //     })
  //     ReviewPage.clickCanBePublishedPublicly()
  //     ReviewPage.getCanBePublishedPubliclyCheckbox().should(
  //       'have.value',
  //       'true',
  //     )
  //     ReviewPage.clickAcceptRadioButton()
  //     ReviewPage.clickSubmitButton()
  //     ReviewPage.waitThreeSec()
  //     DashboardPage.clickControl() // Navigate to Control Page
  //     ControlPage.clickDecisionTab(1)
  //     ControlPage.clickShow()
  //     ControlPage.getAcceptedToPublishReview().should('be.visible')
  //   })
  // })

  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)
    cy.request('POST', `${seedUrl}/senior_editor_assigned`)
  })

  context('sending notifications via "Tasks" control panel', () => {
    beforeEach(() => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, dashboard)
      })
      cy.awaitDisappearSpinner()
      DashboardPage.getHeader().should('be.visible')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickControlLink()
      cy.awaitDisappearSpinner()
      cy.contains('Tasks & Notifications').click()
    })

    it('sending notification to unregistered user', () => {
      createTask({
        assignee: 'Unregistered User',
        title: 'First task for unregistered user',
      })

      cy.get('[data-cy="new-user-email"]').should('be.visible')
      cy.get('[data-cy="new-user-email"]').type('uku.sidorela@gmail.com')
      cy.get('[data-cy="new-user-name"]').type('QA tester')

      cy.get('[data-cy="new-user-email"]').should(
        'have.value',
        'uku.sidorela@gmail.com',
      )
      cy.get('[data-cy="new-user-name"]').should('have.value', 'QA tester')
    })

    it('sending 3 notifications via task details modal', () => {
      createTask({
        assignee: 'Collaborative reviewer',
        title: 'First task for registered users',
      })
      cy.get('[data-testid=minimal-button]').last().click()
      cy.get('[data-testid=task-edit-label]').last().click()
      cy.contains('Task details').should('exist')
      cy.contains('span', 'Add Notification Recipient').should('be.visible')
      cy.contains('button', 'Add Notification Recipient').click()

      cy.contains('button', 'Add Notification Recipient')
        // .click()
        .then(() => {
          cy.get('body').then($body => {
            // If the form didn't appear yet, click again
            if ($body.find('[data-testid="Recipient_select"]').length === 0) {
              cy.wait(100) // slight buffer for animations
              cy.contains('button', 'Add Notification Recipient').click()
            }
          })
        })

      sendTaskNotification({
        recipient: 'Joane Pilger',
        template: 'Reviewer',
      })
      // This does not work
      // cy.get('[class*=TaskEditModal__NotificationLogsToggle]').click()
      // cy.contains('Reviewer Invitation sent by Sinead Sullivan to Joane Pilger')

      cy.get(
        '[data-testid=secondary-action-button-label-only-span]:last',
      ).click({
        force: true,
      })

      sendTaskNotification({
        recipient: 'Sherry Crofoot',
        template: 'Author',
      })
      // cy.get('[class*=TaskEditModal__NotificationLogsToggle]').click()
      // cy.contains('Author Invitation sent by Sinead Sullivan to Sherry Crofoot')

      cy.get(
        '[data-testid=secondary-action-button-label-only-span]:last',
      ).click({
        force: true,
      })

      sendTaskNotification({
        recipient: 'Gale Davis',
        template: 'Task',
      })
      // cy.get('[class*=TaskEditModal__NotificationLogsToggle]').click()
      // cy.contains('Task notification sent by Sinead Sullivan to Gale Davis')

      cy.contains('Send Now').click()
      // cy.get('[class*=ActionButton__BaseButton]:last').click()
    })
  })
})

function createTask({ assignee, title }) {
  cy.get('[title="Add a new task"]').click()

  cy.get('[data-testid="text-input"]:last').type(`${title}`)

  // Open the assignee select field
  cy.get('[data-testid="Assignee_select"]').last().click()

  cy.get('[data-testid="Assignee_select"] input').last().type(`${assignee}`, {
    delay: 100,
  })

  // Wait for the dropdown option to appear and click it
  cy.get('.react-select__option')
    .contains(assignee)
    .should('be.visible')
    .click()
}

function sendTaskNotification({ recipient, template }) {
  cy.contains('button', 'Add Notification Recipient').should(
    'have.attr',
    'disabled',
  )

  cy.get('[data-testid="Recipient_select"] input')
    .last()
    .should('exist')
    .type(`${recipient}{enter}`, { force: true })

  cy.get('[data-testid="Notification_email_select"]:last').click()
  cy.get('[data-testid="Notification_email_select"] input')
    .last()
    .type(`${template}{enter}`, { force: true })

  // cy.contains('Send Now').click()
}
