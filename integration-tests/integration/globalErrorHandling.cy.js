const homePage = require('../pages/homepage/homepagePage')

context('Global errors', () => {
  beforeEach(() => {
    cy.session('hmpps-session', () => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
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

  it('should render error page', () => {
    cy.task('stubGetDetailsFailure', { status: 500 })
    cy.visit('/prisoner/A12345', { failOnStatusCode: false })

    cy.get('h1').should('have.text', 'Sorry, there is a problem with the service')
  })

  it('should render page not found', () => {
    cy.task('stubGetDetailsFailure', { status: 404 })
    cy.visit('/prisoner/A12345', { failOnStatusCode: false })

    cy.get('h1').should('have.text', 'Page not found')
  })
})
