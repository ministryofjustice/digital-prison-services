const homePage = require('../pages/homepage/homepagePage')

context('Redirect from old bookmark', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: 'MDI',
    })
    cy.signIn()

    cy.task('stubUserMeRoles')
    cy.task('stubUserLocations')
    cy.task('stubStaffRoles', [])
    cy.task('stubLocationConfig', { agencyId: 'MDI', response: { enabled: false } })
    cy.task('stubKeyworkerMigrated')
  })

  it('should show the warning then continue to the homepage', () => {
    cy.task('stubUserMe', {})
    cy.visit('/redirect')

    cy.get('h1').should('have.text', 'The address you are using will soon be deleted')
    cy.get('[data-test="continue-button"]').click()

    homePage.verifyOnPage()
  })

  it('should show the warning then continue to the supplied url', () => {
    cy.task('stubUserMe', {})
    cy.visit('/redirect/manage-prisoner-whereabouts?exampleparam=true')

    cy.get('h1').should('have.text', 'The address you are using will soon be deleted')
    cy.get('[data-test="continue-button"]').click()

    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/manage-prisoner-whereabouts')
      expect(loc.search).to.eq('?exampleparam=true')
    })
  })
})
