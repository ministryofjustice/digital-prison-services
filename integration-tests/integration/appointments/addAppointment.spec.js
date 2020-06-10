const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const AddAppointmentPage = require('../../pages/appointments/addAppointmentPage')
const ConfirmSingleAppointmentPage = require('../../pages/appointments/confirmSingleAppointmentPage')

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
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    cy.task('stubAppointmentTypes', [
      { code: 'ACTI', description: 'Activities' },
      { code: 'VLB', description: 'Video Link Booking' },
    ])
    cy.task('stubAppointmentsAtAgency', 'MDI', [])
    cy.task('stubVisitsAtAgency', 'MDI', [])
    cy.task('stubPostAppointments')

    const offenderNo = 'A12345'
    cy.visit(`/offenders/${offenderNo}/add-appointment`)
  })

  it('A user can successfully add an appointment', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage()
    const form = addAppointmentPage.form()
    form.appointmentType().select('ACTI')
    form.location().select('1')
    form.startTimeHours().select('23')
    form.startTimeMinutes().select('55')
    form.recurringNo().click()
    form.comments().type('Test comment')
    form.date().type(moment().format('DD/MM/yyyy'))
    form.submitButton().click()
    ConfirmSingleAppointmentPage.verifyOnPage()
  })
})
