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
        // login as admin
        cy.login(name.role.admin, dashboard)

        // select Control on the Manuscripts page
        Menu.clickManuscripts()

        ManuscriptsPage.selectOptionWithText('Control')
        cy.reload()
        // added a reload here because tests were failing on an unhandled promise.

        // assign seniorEditor
        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor)

        ControlPage.clickAssignHandlingEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor)

        ControlPage.clickAssignEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.admin)

        // reject submission
        cy.log('Admin rejects a submission.')
        ControlPage.clickDecisionTab(1)
        ControlPage.fillInDecision(data.rejectedDecision)
        ControlPage.clickReject()
        ControlPage.clickSubmit()
        ControlPage.checkSvgExists()
      })
    })

    cy.contains('Dashboard').click()
  })
})
