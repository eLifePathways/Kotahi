/* eslint-disable promise/always-return */

import { dashboard } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'

describe('Checking manuscripts page: label selection and tooltip', () => {
  before(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    cy.request('POST', `${restoreUrl}/commons.colab_bootstrap`)

    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    DashboardPage.getHeader().should('be.visible')
    // submission of new manuscript
    DashboardPage.clickSubmit()
    NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    Menu.clickManuscriptsAndAssertPageLoad()
  })

  it('verifies the selected label after choosing from the dropdown', () => {
    cy.contains('div', 'Manuscripts').should('exist')
    // Click the Select button
    ManuscriptsPage.getSelectButton().should('be.visible')
    ManuscriptsPage.clickArticleLabel(-1)

    // Function to select a label and verify it
    const selectLabelAndVerify = label => {
      cy.get('[class*=LabelDropdown__DropdownElement]').click()
      cy.screenshot('before-dropdown')
      cy.get('body').then($body => {
        if (!$body.find('[class*=LabelDropdown__DropdownMenu]').length) {
          cy.log('Dropdown not found in body!')
        }
      })

      cy.get('[class*=LabelDropdown__DropdownMenu]').contains(label).click()
      ManuscriptsPage.getLabelDropdown().should('contain', label)
      Menu.clickManuscriptsAndAssertPageLoad()
    }

    // Test different labels
    const labels = ['Ready to evaluate', 'Evaluated', 'Ready to publish']
    labels.forEach(selectLabelAndVerify)

    // Unset the custom label
    cy.get('[class*=LabelDropdown__StyledButton]').eq(0).click()
    cy.get('[class*=style__StyledButton]').should('contain', 'Select')
  })

  context('tooltip tests', () => {
    beforeEach(() => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, dashboard)
      })
      cy.awaitDisappearSpinner()
    })

    it('check no tooltip for empty abstract', () => {
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getTooltipText().should('not.exist')
      ManuscriptsPage.getTooltipIcon().should('not.exist')
    })

    it('check tooltip text', () => {
      cy.contains('Continue Submission').click()
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInAbstractColab(data.abstract)
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.getTooltipText().should('not.exist')
        ManuscriptsPage.getTooltipIcon()
          .should('be.visible')
          .trigger('mouseover')
        ManuscriptsPage.getTooltipText()
          .should('contain', data.abstract)
          .and('not.contain', '<p class="paragraph">')
      })
    })

    it('check length for the tooltip text, to be less than 1000', () => {
      cy.contains('Continue Submission').click()
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInAbstractColab(
          data.abstractWithMoreThan1000Characters,
        )
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.getTooltipText().should('not.exist')
        ManuscriptsPage.getTooltipIcon().trigger('mouseover')
        ManuscriptsPage.getTooltipText()
          .should('contain', '...')
          .should('have.lengthOf.lessThan', 1000)
      })
    })
  })
})
