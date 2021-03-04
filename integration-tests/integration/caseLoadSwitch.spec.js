context('Caseloads witched page behaves correctly', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', {
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
    cy.login()
  })
  it('should successfully change caseload', () => {
    cy.task('stubUserMe', {})
    cy.visit('/change-caseload')
    cy.get('#changeCaseloadSelect').select('Leeds (HMP)')
    cy.get('button').click()
  })
})
