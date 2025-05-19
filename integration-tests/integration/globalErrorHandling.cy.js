const homePage = require('../pages/homepage/homepagePage')

context('Global errors', () => {
  beforeEach(() => {
    cy.session('hmpps-session', () => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [] })
      cy.signIn()
    })

    cy.task('stubKeyworkerMigrated')
  })

  it('should render 404 page', () => {
    cy.visit('/hello', { failOnStatusCode: false })
    cy.get('h1').should('have.text', 'Page not found')
    cy.get('[role="button"]').click()

    homePage.verifyOnPage()
  })
})
