const homepagePage = require('../pages/homepage/homepagePage')

context('Common component functionality', () => {
  before(() => {
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubUserLocations')
    cy.task('stubStaffRoles', { roles: [] })
    cy.task('stubLocationConfig', { agencyId: 'MDI', response: { enabled: false } })
    cy.task('stubKeyworkerMigrated')
    cy.task('stubComponents')
  })

  it('Sign in takes user to sign in page', () => {
    cy.task('stubSignIn', {})
    cy.signIn()
    const page = homepagePage.goTo()
    page.commonComponentsHeader().should('exist')
    page.commonComponentsFooter().should('exist')
  })
})
