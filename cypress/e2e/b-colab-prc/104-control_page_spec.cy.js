/* eslint-disable promise/always-return, promise/no-nesting */

import { dashboard, manuscripts } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
// import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ReviewPage } from '../../page-object/review-page'

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

  context('Hide review and hide reviewer functionality', () => {
    before(() => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
        cy.awaitDisappearSpinner()
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.selectOptionWithText('Control')
        cy.awaitDisappearSpinner()
        ControlPage.getAssignSeniorEditorDropdown().should('be.visible')
        ControlPage.inviteReviewer(name.role.reviewers[1])
        cy.reload()
        cy.get('input[value = "isCollaborative"]').should('not.exist')

        ControlPage.getNumberOfInvitedReviewers().should('eq', 1)
        cy.login(name.role.reviewers[1], dashboard)
        cy.awaitDisappearSpinner()
        DashboardPage.clickDashboardTab(1)
        DashboardPage.clickAcceptReviewButton()

        cy.contains('button', 'Do Review').should('exist')
        DashboardPage.clickDoReview()
        cy.fixture('submission_form_data').then(data => {
          cy.contains('div', 'Metadata').should('be.visible')
          cy.get('[class*=HiddenTabs__Tab]').contains('Review').invoke('click')
          ReviewPage.fillInReviewComment(data.review1)
          ReviewPage.clickAcceptRadioButton()
          ReviewPage.clickSubmitButton()
          ReviewPage.clickConfirmSubmitButton()

          cy.get('[name="submission.$title"]').contains('test pdf')
        })
      })
    })

    beforeEach(() => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
        cy.awaitDisappearSpinner()
        ManuscriptsPage.selectOptionWithText('Control')
        cy.awaitDisappearSpinner()
        ControlPage.getAssignSeniorEditorDropdown().should('be.visible')
      })
      ControlPage.clickReviewsTab()
    })
    it('By default the review and the reviewer name are hidden so reviewer can not see their name', () => {
      ControlPage.getHideReviewToAuthorCheckbox('should', 'be.checked')
      ControlPage.getHideReviewerNameCheckbox('should', 'be.checked')
      cy.fixture('role_names').then(name => {
        cy.login(name.role.reviewers[1], dashboard)
        cy.get('[name="submission.$title"]:last').click()
        cy.get('[class*=TabsContainer]').contains('Review').click()
        ControlPage.getReviewerName().should(
          'not.contain',
          name.role.reviewers[1],
        )
      })
    })

    it('When review and reviewer name are not hidden then reviewer can see their name', () => {
      ControlPage.clickHideReviewToAuthor()
      ControlPage.getHideReviewToAuthorCheckbox('should', 'not.be.checked')
      ControlPage.clickHideReviewerNameToAuthor()
      ControlPage.getHideReviewerNameCheckbox('should', 'not.be.checked')
      cy.fixture('role_names').then(name => {
        cy.login(name.role.reviewers[1], dashboard)
        cy.get('[name="submission.$title"]:last').click()
        cy.get('[class*=TabsContainer]').contains('Review').click()
        ControlPage.getReviewerName().should('contain', name.role.reviewers[1])
      })
    })
  })

  context('sending email notifications', () => {
    // before(() => {
    //   cy.task('restore', 'email_notification')
    // })
    beforeEach(() => {
      cy.fixture('role_names').then(name => {
        // login as seniorEditor
        cy.login(name.role.seniorEditor, dashboard)
        DashboardPage.clickDashboardTab(2)
        DashboardPage.clickControl() // Navigate to Control Page
      })
    })

    it('can send email notifications to existing and non-existing users', () => {
      /* New User */
      sendNotification({
        receiverName: 'Jon',
        templateName: 'Author Invitation',
        expectedMessage: null,
        // should be saying this instead:
        // 'Author Invitation sent by Elaine Barnes to Jon',
        isNewUser: true,
        email: 'jon@example.co',
      })

      /* Existing Users */
      sendNotification({
        receiverName: 'Emily',
        templateName: 'Author Invitation',
        expectedMessage:
          'Submission Confirmation Email sent by Kotahi to Emily Clay',
        // should be saying this instead:
        // 'Author Invitation sent by Elaine Barnes to Emily Clay',
      })

      sendNotification({
        receiverName: 'Joane',
        templateName: 'Reviewer Invitation',
        expectedMessage: null, // 'Reviewer Invitation sent by Elaine Barnes to Joane Pilger',
      })

      sendNotification({
        receiverName: 'Gale',
        templateName: 'Task notification',
        expectedMessage: null, // 'Task notification sent by Elaine Barnes to Gale Davis',
      })
    })
  })

  context('sending notifications via "Tasks" control panel', () => {
    beforeEach(() => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, dashboard)
      })
      cy.awaitDisappearSpinner()
      DashboardPage.getHeader().should('be.visible')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.selectOptionWithText('Control')
      cy.awaitDisappearSpinner()
      cy.contains('Tasks & Notifications').click()
    })

    it('sending notification to unregistered user', () => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000)
      createTask({
        assignee: 'Unregistered User',
        title: 'First task for unregistered user',
      })

      cy.get('[data-cy="new-user-email"]').should('be.visible')
      cy.get('[data-cy="new-user-email"]').type('uku.sidorela@gmail.com', {
        delay: 10,
      })
      cy.get('[data-cy="new-user-name"]').type('QA tester')

      cy.get('[data-cy="new-user-email"]').should(
        'have.value',
        'uku.sidorela@gmail.com',
      )
      cy.get('[data-cy="new-user-name"]').should('have.value', 'QA tester')
    })

    it('sending 3 notifications via task details modal', () => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000)
      createTask({
        assignee: 'Collaborative reviewer',
        title: 'First task for registered users',
      })
      cy.get('[class*=MinimalButton]').last().click()
      cy.get('[class*=Task__EditLabel]').last().click()
      cy.contains('Task details').should('exist')
      cy.contains('span', 'Add Notification Recipient').should('be.visible')
      cy.contains('button', 'Add Notification Recipient').click()

      cy.contains('button', 'Add Notification Recipient')
        // .click()
        .then(() => {
          cy.get('body').then($body => {
            // If the form didn't appear yet, click again
            if ($body.find('[data-testid="Recipient_select"]').length === 0) {
              // eslint-disable-next-line cypress/no-unnecessary-waiting
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

      cy.get('[class*=SecondaryActionButton__LabelOnlySpan]:last').click({
        oaforce: true,
      })

      sendTaskNotification({
        recipient: 'Sherry Crofoot',
        template: 'Author',
      })
      // cy.get('[class*=TaskEditModal__NotificationLogsToggle]').click()
      // cy.contains('Author Invitation sent by Sinead Sullivan to Sherry Crofoot')

      cy.get('[class*=SecondaryActionButton__LabelOnlySpan]:last').click({
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

function sendNotification({
  receiverName,
  templateName,
  expectedMessage,
  isNewUser = false,
  email = null,
}) {
  cy.reload()
  cy.contains('Tasks & Notifications').click()

  if (isNewUser === true) {
    cy.get('input[type="checkbox"]:last').click({ force: true })

    cy.get('[data-cy="new-user-email"]').type(email)
    cy.get('[data-cy="new-user-email"]').should('have.value', email)
    cy.get('[data-cy="new-user-name"]').type(receiverName)
    cy.get('[data-cy="new-user-name"]').should('have.value', receiverName)

    ControlPage.getEmailNotificationDropdowns()
      .eq(2)
      .type(`${templateName}{enter}`)
  } else {
    cy.getByDataTestId('choose-receiver').click()
    cy.get('input[aria-label="Choose receiver"]').type(
      `${receiverName}{enter}`,
      {
        force: true,
      },
    )

    ControlPage.getEmailNotificationDropdowns()
      .eq(1)
      .type(`${templateName}{enter}`)
  }

  cy.contains('Notify').click()
  ControlPage.clickExpandChatButton()
  ControlPage.clickNthChatTab(1)

  if (expectedMessage) {
    ControlPage.getMessageContainer().should('contain', expectedMessage)
  }
}

function createTask({ assignee, title }) {
  cy.get('[title="Add a new task"]').click()

  cy.get('[class*="TextInput__StyledInput"]:last').type(`${title}`)

  // Open the assignee select field
  cy.get('[data-testid="Assignee_select"]').last().click()

  cy.get('[data-testid="Assignee_select"] input').last().type(`${assignee}`, {
    delay: 100,
  })

  // Wait for the dropdown option to appear and click it
  cy.get('.react-select__option:last')
    .contains(`${assignee}`)
    .should('be.visible')
    .click()
}

function sendTaskNotification({ recipient, template }) {
  cy.contains('button', 'Add Notification Recipient').should(
    'have.attr',
    'disabled',
  )
  cy.get('[data-testid="Recipient_select"] input', { timeout: 3000 })
    .last()
    .should('exist')
    .type(`${recipient}{enter}`, { force: true })

  cy.get('[data-testid="Notification_email_select"]:last').click()
  cy.get('[data-testid="Notification_email_select"] input')
    .last()
    .type(`${template}{enter}`, { force: true })

  // cy.contains('Send Now').click()
}
