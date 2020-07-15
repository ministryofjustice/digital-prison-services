const moment = require('moment')
const ViewAppointmentsPage = require('../../pages/appointments/viewAppointmentsPage')

context('A user can add an appointment', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubAppointmentTypes', [
      { code: 'ACTI', description: 'Activities' },
      { code: 'VLB', description: 'Video Link Booking' },
    ])
    cy.task('stubAppointmentsAtAgency', 'MDI', [])
    cy.task('stubLocation', 1)
    cy.task('stubCourts')
    cy.task('stubAddVideoLinkAppointment')
    cy.task('stubAgencyDetails', { agencyId: 'MDI', details: {} })
    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubAppointmentsGet')
    cy.task('stubVideoLinkAppointments')

    cy.visit('/appointments')
  })

  it('A user is presented with the no data message when no data', () => {
    const viewAppointmentsPage = ViewAppointmentsPage.verifyOnPage()
    viewAppointmentsPage.noResultsMessage().should('be.visible')
  })
})
