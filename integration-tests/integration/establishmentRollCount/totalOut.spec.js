context('A user can see the list of total out today', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubClientCredentialsRequest')
    cy.task('stubGetIepSummaryForBookingIds', [
      {
        bookingId: -1,
        iepLevel: 'Basic',
      },
      {
        bookingId: -2,
        iepLevel: 'Standard',
      },
    ])
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
          bookingId: -1,
          dateOfBirth: '1980-01-01',
          firstName: 'AAAAB',
          lastName: 'AAAAB',
          reasonDescription: 'Normal transfer',
          timeOut: '01:01:45',
        },
        {
          offenderNo: 'G0000AA',
          bookingId: -2,
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
      .then(($cells) => {
        expect($cells.length).to.eq(18)

        expect($cells.get(1)).to.contain('Aaaaa, Aaaaa')
        expect($cells.get(2)).to.contain('G0000AA')
        expect($cells.get(3)).to.contain('31/12/1980')
        expect($cells.get(5).innerText).to.contain('Standard')

        expect($cells.get(10)).to.contain('Aaaab, Aaaab')
        expect($cells.get(11)).to.contain('A1234AA')
        expect($cells.get(12)).to.contain('01/01/1980')
        expect($cells.get(14).innerText).to.contain('Basic')
      })
  })
})
