context('Caseload switcher', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: 'MDI',
      caseloads: [
        {
          caseLoadId: 'MDI',
          description: 'Moorland (HMP)',
          currentlyActive: true,
        },
        {
          caseLoadId: 'LEI',
          description: 'Leeds (HMP)',
          currentlyActive: false,
        },
      ],
    })
    cy.signIn()
  })

  it('should successfully change caseload', () => {
    // cy.task('stubUserMe', {})
    cy.visit('/change-caseload')
    cy.get('#changeCaseloadSelect').select('Leeds (HMP)')
    cy.get('button').click()
  })

  context('When user is in a redirecting caseload', () => {
    it('should redirect to the new change caseload page', () => {
      cy.signIn('/change-caseload')
      cy.url().should('include', 'dpshomepage/change-caseload')
    })

    it('should redirect to the new change caseload page maintaining search params', () => {
      cy.signIn('/change-caseload?someParam=quimby')
      cy.url().should('include', 'dpshomepage/change-caseload?someParam=quimby')
    })
  })
})
