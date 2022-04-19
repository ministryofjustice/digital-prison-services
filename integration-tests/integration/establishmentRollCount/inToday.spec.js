/* eslint-disable no-unused-expressions */
const moment = require('moment')

context('A user can see the list of offenders in today', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubClientCredentialsRequest')
    cy.task('stubIepSummaryForBookingIds')
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
    cy.task('stubMovementsIn', {
      agencyId: 'MDI',
      fromDate: moment().format('YYYY-MM-DD'),
      movements: [
        {
          offenderNo: 'A1234AA',
          dateOfBirth: '1980-01-01',
          bookingId: -1,
          firstName: 'AAAAB',
          lastName: 'AAAAB',
          iepLevel: 'Basic',
          fromAgency: 'MDI',
          fromAgencyDescription: 'Moorland (HMP)',
          location: 'MDI-1-1',
          movementTime: '11:11:11',
        },
        {
          offenderNo: 'G0000AA',
          dateOfBirth: '1980-12-31',
          bookingId: -2,
          firstName: 'AAAAA',
          lastName: 'AAAAA',
          iepLevel: 'Enhanced',
          fromCity: 'Leeds',
          movementTime: '12:12:12',
        },
      ],
    })
  })

  it('should load data correctly', () => {
    cy.visit('/establishment-roll/in-today')
    cy.get('h1').contains('In today')
    cy.get('table tr')
      .find('td')
      .then(($cells) => {
        expect($cells.length).to.eq(18)

        expect($cells.get(1)).to.contain('Aaaaa, Aaaaa')
        expect($cells.get(2)).to.contain('G0000AA')
        expect($cells.get(3)).to.contain('31/12/1980')
        expect($cells.get(4)).to.contain('Enhanced')
        expect($cells.get(5)).to.be.empty
        expect($cells.get(6)).to.contain('12:12')
        expect($cells.get(7)).to.contain('Leeds')
        expect($cells.get(8)).to.contain('Racist')

        expect($cells.get(10)).to.contain('Aaaab, Aaaab')
        expect($cells.get(11)).to.contain('A1234AA')
        expect($cells.get(12)).to.contain('01/01/1980')
        expect($cells.get(13)).to.contain('Basic')
        expect($cells.get(14)).to.contain('1-1')
        expect($cells.get(15)).to.contain('11:11')
        expect($cells.get(16)).to.contain('Moorland (HMP)')
        expect($cells.get(17)).to.contain('CAT A')
      })
  })
})
