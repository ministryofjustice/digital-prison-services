const homePage = require('../../pages/homepage/homePage')

context('Home page', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  it('should show only global search task', () => {
    cy.task('stubUserMeRoles', [
      { roleCode: 'GLOBAL_SEARCH' },
      { roleCode: 'OMIC_ADMIN' },
      { roleCode: 'KEYWORKER_MONITOR' },
    ])

    const page = homePage.goTo()

    page.globalSearch().should('exist')
    page.manageKeyworkers().should('exist')
  })
})
