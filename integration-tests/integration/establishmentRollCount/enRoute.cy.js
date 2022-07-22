context('A user can see the list of offenders in reception', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubClientCredentialsRequest')
    cy.task('stubGetIepSummaryForBookingIds', [])
    cy.task('stubSystemAlerts')
    cy.task('stubAssessments', ['A1234AA', 'G0000AA'])
    cy.task('stubOffenderMovements')
    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
    cy.task('stubInReception', {
      agencyId: 'MDI',
      results: [
        {
          offenderNo: 'A1234AA',
          bookingId: -1,
          dateOfBirth: '1980-01-01',
          firstName: 'AAAAB',
          lastName: 'AAAAA',
          fromAgencyDescription: 'Hull (HMP)',
          movementTime: '01:01:45',
          location: 'LEI-A-01-011',
        },
        {
          offenderNo: 'G0000AA',
          bookingId: -2,
          dateOfBirth: '1980-12-31',
          firstName: 'AAAAA',
          lastName: 'AAAAA',
          fromAgencyDescription: 'Outside',
          movementTime: '23:59:59',
          location: 'LEI-A-02-011',
        },
      ],
    })

    cy.task('stubEnRoute', {
      agencyId: 'MDI',
      results: [
        {
          firstName: 'firstname1',
          lastName: 'lastName1',
          offenderNo: 'A1234AA',
          fromAgencyDescription: 'Low Newton (HMP)',
          movementReasonDescription: 'Normal transfer',
          movementTime: '12:00:00',
          movementDate: '2019-10-10',
          dateOfBirth: '2019-10-10',
        },
        {
          firstName: 'firstName2',
          lastName: 'lastName2',
          offenderNo: 'G0000AA',
          fromAgencyDescription: 'Leeds (HMP)',
          movementReasonDescription: 'Normal transfer',
          movementTime: '13:00:00',
          movementDate: '2018-10-10',
          dateOfBirth: '1980-10-10',
        },
      ],
    })
  })

  it('should load data correctly', () => {
    cy.visit('/establishment-roll/en-route')
    cy.get('h1').contains('En route to Moorland')
    cy.get('table tr')
      .find('td')
      .then(($cells) => {
        expect($cells.length).to.eq(16)

        expect($cells.get(1)).to.contain('Lastname1, Firstname1')
        expect($cells.get(2)).to.contain('A1234AA')
        expect($cells.get(3)).to.contain('10/10/2019')
        expect($cells.get(4)).to.contain('12:00')
        expect($cells.get(5)).to.contain('Low Newton (HMP)')
        expect($cells.get(6)).to.contain('Normal transfer')

        expect($cells.get(9)).to.contain('Lastname2, Firstname2')
        expect($cells.get(10)).to.contain('G0000AA')
        expect($cells.get(11)).to.contain('10/10/1980')
        expect($cells.get(12)).to.contain('13:00')
        expect($cells.get(13)).to.contain('Leeds (HMP)')
        expect($cells.get(14)).to.contain('Normal transfer')
      })
  })
})
