/* eslint-disable no-unused-expressions */
const moment = require('moment')

context('A user can see the list of offenders out today', () => {
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
    cy.task('stubSystemAlerts', [
      {
        offenderNo: 'G0000AA',
        expired: false,
        alertCode: 'XR',
      },
    ])
    cy.task('stubAssessments', ['A1234AA', 'G0000AA'])
    cy.task('stubUserMeRoles', [])
    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
    cy.task('stubMovementsOut', {
      agencyId: 'MDI',
      fromDate: moment().format('YYYY-MM-DD'),
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
    cy.visit('/establishment-roll/out-today')
    cy.get('h1').contains('Out today')
    cy.get('table tr')
      .find('td')
      .then(($cells) => {
        expect($cells.length).to.eq(14)

        expect($cells.get(1)).to.contain('Aaaaa, Aaaaa')
        expect($cells.get(2)).to.contain('G0000AA')
        expect($cells.get(3)).to.contain('31/12/1980')
        expect($cells.get(4)).to.contain('23:59')
        expect($cells.get(5)).to.contain('Normal transfer')
        expect($cells.get(6)).to.contain('Racist')

        expect($cells.get(8)).to.contain('Aaaab, Aaaab')
        expect($cells.get(9)).to.contain('A1234AA')
        expect($cells.get(10)).to.contain('01/01/1980')
        expect($cells.get(11)).to.contain('01:01')
        expect($cells.get(12)).to.contain('Normal transfer')
        expect($cells.get(13)).to.contain('CAT A')
      })
  })
})
