const moment = require('moment')

context('Establishment roll has moved', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })
  beforeEach(() => {
    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
  })

  it('should load the establishment roll has moved page', () => {
    cy.visit('/establishment-roll')

    cy.get('h1').should('contain', 'Establishment roll has moved')
    cy.get('a[href="http://localhost:9191/dpshomepage//establishment-roll"]').should('contain', 'new web address')
    cy.get('a[href="http://localhost:9191/dpshomepage//whats-new/establishment-roll-update"]').should(
      'contain',
      "changes we've made to the Establishment roll"
    )
  })
})
