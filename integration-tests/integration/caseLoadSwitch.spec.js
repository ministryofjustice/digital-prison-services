context('Caseloads witched page behaves correctly', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  it('should successfully change caseload', () => {
    cy.task('stubUserCaseLoads', [
      {
        caseLoadId: 'MDI',
        description: 'Moorland Closed (HMP & YOI)',
        type: 'INST',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
      },
      {
        caseLoadId: 'LEI',
        description: 'Leeds (HMP)',
        type: 'INST',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
      },
    ])
    cy.task('stubUserMe')
    cy.visit('/change-caseload')
    cy.get('#changeCaseloadSelect').select('Leeds (HMP)')
    // Currently we can't test the redirect to NOTM without
    // disabling chrom web security for all tests.
    // This test fails if the stub below is removed,
    // which means the expected request is made to update the caseload
    cy.task('stubUpdateCaseload')
    cy.get('button').click()
  })
})
