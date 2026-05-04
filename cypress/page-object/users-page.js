/// <reference types="Cypress" />
/**
 * Page object representing the third option in the left side menu,
 * where the list of users is displayed & the admin is able to delete users.
 */
const TITLE = 'General__Heading'
const USER_TABLE_ROW_LIST = 'Table__Row'
const ADMIN_COLUMN = 'td:nth-child(3)'
const DELETE_USER_BUTTON = 'button:nth-child(1)'
const ADD_GROUP_MANAGER_ROLE_BUTTON = 'button:nth-child(3)'
const REMOVE_GROUP_MANAGER_ROLE_BUTTON = 'button:nth-child(3)'

export const UsersPage = {
  getTitle() {
    return cy.getByContainsClass(TITLE)
  },
  getUserTableRowList() {
    return cy.getByContainsClass(USER_TABLE_ROW_LIST)
  },
  getAdminStatusByRow(nth) {
    return cy.get(ADMIN_COLUMN).eq(nth)
  },
  getNthUserRow(nth) {
    return this.getUserTableRowList().eq(nth)
  },
  getDeleteButton() {
    return cy.get(DELETE_USER_BUTTON)
  },
  getRemoveGroupManagerRoleButton() {
    return cy.get(REMOVE_GROUP_MANAGER_ROLE_BUTTON)
  },
  getAddGroupManagerRoleButton() {
    return cy.get(ADD_GROUP_MANAGER_ROLE_BUTTON)
  },
}
