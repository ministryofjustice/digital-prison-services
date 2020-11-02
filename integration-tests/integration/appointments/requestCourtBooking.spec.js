const moment = require('moment')
const RequestCourtBookingStartPage = require('../../pages/appointments/requestCourtBookingStartPage')
const RequestCourtBookingSelectCourtPage = require('../../pages/appointments/requestCourtBookingSelectCourtPage')
const RequestCourtBookingEnterOffenderDetailsPage = require('../../pages/appointments/requestCourtBookingEnterOffenderDetailsPage')
const RequestCourtBookingConfirmationPage = require('../../pages/appointments/requestCourtBookingConfirmationPage')

context('A user can request a booking', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'WWI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubCourts')
    cy.task('stubAgencies', [{ agencyId: 'WWI', description: 'HMP Wandsworth' }])
    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubUser', 'ITAG_USER', 'WWI')

    cy.visit('/request-booking')
  })

  it('A user can request a video link booking', () => {
    const requestCourtBookingStartPage = RequestCourtBookingStartPage.verifyOnPage()
    const startForm = requestCourtBookingStartPage.form()
    startForm.date().type(
      moment()
        .add(1, 'days')
        .format('DD/MM/YYYY'),
      { force: true }
    )
    startForm.prison().select('WWI')
    startForm.startTimeHours().select('10')
    startForm.startTimeMinutes().select('00')
    startForm.endTimeHours().select('11')
    startForm.endTimeMinutes().select('00')
    startForm.preAppointmentYes().click()
    startForm.postAppointmentYes().click()
    startForm.submitButton().click()

    const requestCourtBookingSelectCourtPage = RequestCourtBookingSelectCourtPage.verifyOnPage()
    requestCourtBookingSelectCourtPage.prison().contains('HMP Wandsworth')
    requestCourtBookingSelectCourtPage.date().contains(
      moment()
        .add(1, 'days')
        .format('D MMMM YYYY')
    )
    requestCourtBookingSelectCourtPage.startTime().contains('10:00')
    requestCourtBookingSelectCourtPage.endTime().contains('11:00')
    requestCourtBookingSelectCourtPage.preStartEndTime().contains('09:40 to 10:00')
    requestCourtBookingSelectCourtPage.postStartEndTime().contains('11:00 to 11:20')

    const selectCourtForm = requestCourtBookingSelectCourtPage.form()
    selectCourtForm.hearingLocation().select('London')
    selectCourtForm.submitButton().click()

    const requestCourtBookingEnterOffenderDetailsPage = RequestCourtBookingEnterOffenderDetailsPage.verifyOnPage()
    const offenderForm = requestCourtBookingEnterOffenderDetailsPage.form()
    offenderForm.firstName().type('John')
    offenderForm.lastName().type('Doe')
    offenderForm.dobDay().type('14')
    offenderForm.dobMonth().type('5')
    offenderForm.dobYear().type('1920')
    offenderForm.comments().type('test')
    offenderForm.submitButton().click()

    const requestCourtBookingConfirmationPage = RequestCourtBookingConfirmationPage.verifyOnPage()
    requestCourtBookingConfirmationPage.prison().contains('HMP Wandsworth')
    requestCourtBookingConfirmationPage.date().contains(
      moment()
        .add(1, 'days')
        .format('dddd D MMMM YYYY')
    )
    requestCourtBookingConfirmationPage.startTime().contains('10:00')
    requestCourtBookingConfirmationPage.endTime().contains('11:00')
    requestCourtBookingConfirmationPage.preStartEndTime().contains('09:40 to 10:00')
    requestCourtBookingConfirmationPage.postStartEndTime().contains('11:00 to 11:20')
    requestCourtBookingConfirmationPage.name().contains('John Doe')
    requestCourtBookingConfirmationPage.dateOfBirth().contains('14 May 1920')
    requestCourtBookingConfirmationPage.courtLocation().contains('London')
  })
})
