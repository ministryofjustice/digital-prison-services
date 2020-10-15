/* eslint-disable no-unused-expressions */
const moment = require('moment')

context('A user can see the list of offenders in today', () => {
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
    cy.task('stubUserMe')
    cy.task('stubUserCaseLoads')
    cy.task('stubMovementsIn', {
      agencyId: 'MDI',
      fromDate: moment().format('YYYY-MM-DD'),
      movements: [
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
  })

  it('should load data correctly', () => {
    cy.visit('/establishment-roll/in-today')
    cy.get('h1').contains('In today')
    cy.get('table tr')
      .find('td')
      .then($cells => {
        expect($cells.length).to.eq(18)

        expect($cells.get(1)).to.contain('Aaaaa, Aaaaa')
        expect($cells.get(2)).to.contain('G0000AA')
        expect($cells.get(3)).to.contain('31/12/1980')
        expect($cells.get(4)).to.be.empty
        expect($cells.get(5)).to.contain('--')
        expect($cells.get(6)).to.contain('23:59')
        expect($cells.get(7)).to.contain('Outside')

        expect($cells.get(10)).to.contain('Aaaaa, Aaaab')
        expect($cells.get(11)).to.contain('A1234AA')
        expect($cells.get(12)).to.contain('01/01/1980')
        expect($cells.get(13)).to.be.empty
        expect($cells.get(14)).to.contain('--')
        expect($cells.get(15)).to.contain('01:01')
        expect($cells.get(16)).to.contain('Hull (HMP)')
        expect($cells.get(17)).to.contain('CAT')
      })
  })
})
