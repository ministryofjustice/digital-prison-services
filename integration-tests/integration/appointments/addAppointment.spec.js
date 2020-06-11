const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const AddAppointmentPage = require('../../pages/appointments/addAppointmentPage')
const ConfirmSingleAppointmentPage = require('../../pages/appointments/confirmSingleAppointmentPage')
const PrePostAppointmentsPage = require('../../pages/appointments/prePostAppointmentsPage')
const ConfirmVideoLinkPrisonPage = require('../../pages/appointments/confirmVideoLinkPrisonPage')

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
    cy.task('stubSchedules', {
      agency: 'MDI',
      location: 1,
      date: moment().format('yyyy-MM-DD'),
      appointments: [],
      visits: [],
      activities: [],
    })
    cy.task('stubSentenceData')
    cy.task('stubLocation', 1)
    cy.task('stubCourts')
    cy.task('stubAddVideoLinkAppointment')
    cy.task('stubAgencyDetails', 'MDI')
    cy.task('stubUserEmail', 'ITAG_USER')

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

  it('A user can successfully add a video link booking', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage()
    const form = addAppointmentPage.form()
    form.appointmentType().select('VLB')
    form.location().select('1')
    form.startTimeHours().select('22')
    form.startTimeMinutes().select('55')
    form.endTimeHours().select('23')
    form.endTimeMinutes().select('55')
    form.recurringNo().click()
    form.comments().type('Test comment')
    form.date().type(moment().format('DD/MM/yyyy'))
    form.submitButton().click()

    const prePostAppointmentsPage = PrePostAppointmentsPage.verifyOnPage()
    const prePostForm = prePostAppointmentsPage.form()
    prePostForm.preAppointmentLocation().select('1')
    prePostForm.preAppointmentDuration().select('20')
    prePostForm.postAppointmentNo().click()
    prePostForm.court().select('Leeds')
    prePostForm.submitButton().click()
    const confirmVideoLinkPrisonPage = ConfirmVideoLinkPrisonPage.verifyOnPage()
    confirmVideoLinkPrisonPage.courtLocation().contains('Leeds')
  })
})
