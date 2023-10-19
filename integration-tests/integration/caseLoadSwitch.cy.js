context('Caseload switched page behaves correctly', () => {
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
})
