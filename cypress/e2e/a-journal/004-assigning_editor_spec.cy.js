/* eslint-disable promise/always-return */

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

        Menu.clickManuscripts()

        ManuscriptsPage.selectOptionWithText('Control')

        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor)

        ControlPage.clickAssignHandlingEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor)

        ControlPage.clickAssignEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.admin)

        // reject submission
        ControlPage.clickDecisionTab()

        cy.intercept('POST', '/graphql').as('autoSaveEditor')
        ControlPage.fillInDecision(data.rejectedDecision)
        cy.wait('@autoSaveEditor')

        cy.intercept('POST', '/graphql').as('autoSaveReject')
        ControlPage.clickReject()
        cy.wait('@autoSaveReject')

        /* eslint-disable-next-line cypress/no-unnecessary-waiting */
        cy.wait(1000)
        ControlPage.clickSubmit()
        ControlPage.checkSvgExists()
      })
    })

    // cy.contains('Dashboard').click()
  })
})
