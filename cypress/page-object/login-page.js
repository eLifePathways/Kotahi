/// <reference types="Cypress" />
/**
 * Page object representing the login page, which contains the
 * login button & the logo. Clicking the login button redirects
 * to the ORCID login page & after the user successfully logs in, the page redirects
 * to the app.
 */
const LOGO = 'img'

export const LoginPage = {
  getLoginButton() {
    return cy.getByDataTestId('login-button')
  },
  clickLogin() {
    this.getLoginButton().click()
  },
  getLogo() {
    return cy.get(LOGO)
  },
  getBackground() {
    return cy.getByDataTestId('login-container')
  },
}
export default LoginPage
