context('A user can see the list of total out today', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubClientCredentialsRequest')
    cy.task('stubIepSummaryForBookingIds')
    cy.task('stubSystemAlerts')
    cy.task('stubAssessments', ['A1234AA', 'G0000AA'])
    cy.task('stubUserMeRoles', [])
    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
    cy.task('stubOffenderMovements')
    cy.task('stubTotalCurrentlyOut', {
      agencyId: 'MDI',
      movements: [
        {
          offenderNo: 'A1234AA',
          dateOfBirth: '1980-01-01',
          firstName: 'AAAAB',
          lastName: 'AAAAB',
          reasonDescription: 'Normal transfer',
          timeOut: '01:01:45',
        },
        {
          offenderNo: 'G0000AA',
          dateOfBirth: '1980-12-31',
          firstName: 'AAAAA',
          lastName: 'AAAAA',
          reasonDescription: 'Normal transfer',
          timeOut: '23:59:59',
        },
      ],
    })
  })

  it('should load data correctly', () => {
    cy.visit('/establishment-roll/total-currently-out')
    cy.get('h1').contains('Total currently out')
    cy.get('table tr')
      .find('td')
      .then($cells => {
        expect($cells.length).to.eq(18)

        expect($cells.get(1)).to.contain('Aaaaa, Aaaaa')
        expect($cells.get(2)).to.contain('G0000AA')
        expect($cells.get(3)).to.contain('31/12/1980')

        expect($cells.get(10)).to.contain('Aaaab, Aaaab')
        expect($cells.get(11)).to.contain('A1234AA')
        expect($cells.get(12)).to.contain('01/01/1980')
      })
  })
})
