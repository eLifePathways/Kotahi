/* eslint-disable promise/always-return */
/* eslint-disable cypress/no-unnecessary-waiting */

import { Menu } from '../../page-object/page-component/menu'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { ControlPage } from '../../page-object/control-page'
import { dashboard } from '../../support/routes'

describe('Assigning editors and decision reject', () => {
  it('Assign editors and admin rejects a submission', () => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.bootstrap`)
    cy.request('POST', `${seedUrl}/submission_complete`)

    cy.fixture('submission_form_data').then(data => {
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, dashboard)

        cy.wait(500)
        Menu.clickManuscripts()

        ManuscriptsPage.selectOptionWithText('Control')

        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor)

        ControlPage.clickAssignHandlingEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor)

        ControlPage.clickAssignEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.admin)

        // reject submission
        cy.wait(500)
        ControlPage.clickDecisionTab()
        ControlPage.fillInDecision(data.rejectedDecision)
        ControlPage.clickReject()

        cy.wait(1000)
        ControlPage.clickSubmit()
        ControlPage.checkSvgExists()
      })
    })

    // cy.contains('Dashboard').click()
  })
})
