const homePage = require('../pages/homepage/homepagePage')

context('Page not found', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  it('should render 404 page', () => {
    cy.visit('/hello')
    cy.get('h1').should('have.text', 'Page not found')
    cy.get('[role="button"]').click()

    homePage.verifyOnPage()
  })
})
