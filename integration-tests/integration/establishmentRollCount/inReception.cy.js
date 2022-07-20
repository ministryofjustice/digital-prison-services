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
          firstName: 'AAAAA',
          lastName: 'AAAAB',
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
  })

  it('should load data correctly', () => {
    cy.visit('/establishment-roll/in-reception')
    cy.get('h1').contains('In reception')
    cy.get('table tr')
      .find('td.govuk-table__cell')
      .then(($cells) => {
        expect($cells.length).to.eq(14)

        expect($cells.get(1).innerText).to.contain('Aaaaa, Aaaaa')
        expect($cells.get(2).innerText).to.contain('G0000AA')
        expect($cells.get(3).innerText).to.contain('31/12/1980')
        expect($cells.get(4).innerText).to.contain('Outside')
        expect($cells.get(5).innerText).to.contain('Standard')

        expect($cells.get(8).innerText).to.contain('Aaaab, Aaaaa')
        expect($cells.get(9).innerText).to.contain('A1234AA')
        expect($cells.get(10).innerText).to.contain('01/01/1980')
        expect($cells.get(11).innerText).to.contain('Hull (HMP)')
        expect($cells.get(12).innerText).to.contain('Basic')
      })
  })
})
