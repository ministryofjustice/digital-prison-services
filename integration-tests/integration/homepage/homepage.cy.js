const homepagePage = require('../../pages/homepage/homepagePage')

context('Homepage', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })

  it('Should show the new DPS home page', () => {
    homepagePage.verifyOnPage()
  })
})
