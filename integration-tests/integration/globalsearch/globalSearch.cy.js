context('Global Search', () => {
  const caseloads = [
    {
      caseLoadId: 'LEI',
      description: 'Leeds',
      currentlyActive: true,
    },
  ]

  beforeEach(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'LEI', caseloads })
  })

  it('should redirect to the new search page', () => {
    cy.task('stubGlobalSearchPage')
    cy.signIn('/global-search')
    cy.url().should('include', 'dpshomepage/global-search')
  })

  it('should redirect to the new search page maintaining search params', () => {
    cy.task('stubGlobalSearchPage')
    cy.signIn('/global-search?searchText=quimby')
    cy.url().should('include', 'dpshomepage/global-search?searchText=quimby')
  })

  it('should redirect to the new results page', () => {
    cy.task('stubGlobalSearchResultsPage')
    cy.signIn('/global-search/results')
    cy.url().should('include', 'dpshomepage/global-search/results')
  })

  it('should redirect to the new search page maintaining search params', () => {
    cy.task('stubGlobalSearchResultsPage')
    cy.signIn('/global-search/results?searchText=quimby')
    cy.url().should('include', 'dpshomepage/global-search/results?searchText=quimby')
  })
})
