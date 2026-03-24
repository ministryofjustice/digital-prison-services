context('Prisoner Search', () => {
  beforeEach(() => {
    cy.session('hmpps-prisoner-dev', () => {
      cy.clearCookies()
      cy.task('resetAndStubTokenVerification')
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'ABC',
        caseloads: [
          {
            caseLoadId: 'ABC',
            description: 'Anything',
            currentlyActive: true,
          },
        ],
      })
    })
  })

  it('Redirects to the new search for any caseload', () => {
    cy.task('stubPrisonerSearchPage')
    cy.signIn('/prisoner-search')
    cy.url().should('include', 'dpshomepage/prisoner-search')
  })

  it('Redirects to the new search for any caseload and keeps query params', () => {
    cy.task('stubPrisonerSearchPage')
    cy.signIn('/prisoner-search?one=foo&two=bar')
    cy.url().should('include', 'dpshomepage/prisoner-search?one=foo&two=bar')
  })
})
