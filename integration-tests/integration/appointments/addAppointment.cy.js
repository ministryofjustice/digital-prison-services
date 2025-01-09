const moment = require('moment')

const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const AddAppointmentPage = require('../../pages/appointments/addAppointmentPage')
const ConfirmSingleAppointmentPage = require('../../pages/appointments/confirmSingleAppointmentPage')

context('A user can add an appointment', () => {
  beforeEach(() => {
    cy.session('hmpps-session-dev', () => {
      cy.clearCookies()
      cy.task('resetAndStubTokenVerification')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
    })
    const offenderNo = 'A12345'
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    cy.task('stubAppointmentTypes', [{ code: 'ACTI', description: 'Activities' }])
    cy.task('stubAppointmentsAtAgency', 'MDI', [])
    cy.task('stubVisitsAtAgency', 'MDI', [])
    cy.task('stubCreateAppointment')
    cy.task('stubSchedules', {
      agency: 'MDI',
      location: 1,
      date: moment().format('yyyy-MM-DD'),
      appointments: [
        {
          offenderNo,
          firstName: 'TEST',
          lastName: 'USER',
          cellLocation: 'LEI-A-1-1',
          comment: 'Appt details',
          event: 'MEDE',
          eventId: 106,
          eventDescription: 'Medical - Dentist',
          eventLocation: 'Medical Room1',
          startTime: '2017-10-15T15:30:00',
          locationId: 4,
        },
      ],
      visits: [
        {
          offenderNo,
          firstName: 'TEST',
          lastName: 'USER',
          cellLocation: 'LEI-A-1-1',
          event: 'VISIT',
          eventId: 103,
          eventLocation: 'Visiting room',
          eventDescription: 'Visits',
          comment: 'Friends',
          startTime: '2017-10-15T18:00:00',
          endTime: '2017-10-15T18:30:00',
          locationId: 3,
        },
      ],
      activities: [
        {
          offenderNo,
          firstName: 'TEST',
          lastName: 'USER',
          cellLocation: 'LEI-A-1-1',
          comment: 'Appt details',
          event: 'MEDE',
          eventId: 106,
          eventDescription: 'Medical - Dentist',
          eventLocation: 'Medical Room1',
          startTime: '2017-10-15T15:30:00',
          locationId: 4,
        },
      ],
    })
    cy.task('stubSentenceData')
    cy.task('stubLocation', { locationId: 1 })
    cy.task('stubCourts')
    cy.task('stubAddVideoLinkBooking')
    cy.task('stubAgencyDetails', { agencyId: 'MDI', details: {} })
    cy.task('stubUserEmail', 'ITAG_USER')

    cy.visit(`/offenders/${offenderNo}/add-appointment`)
  })

  it('A user can successfully add an appointment', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage('John Smith')
    const form = addAppointmentPage.form()

    form.date().click()
    addAppointmentPage.todaysDate().click()
    form.appointmentType().select('ACTI')
    form.location().select('1')
    form.startTimeHours().select('23')
    form.startTimeMinutes().select('55')
    addAppointmentPage.offenderEvents().contains('Visiting room - Visits - Friends')
    addAppointmentPage.locationEvents().contains('Medical Room1 - Medical - Dentist - Appt details')
    form.recurringNo().click()
    form.comments().type('Test comment')
    form.submitButton().click()
    ConfirmSingleAppointmentPage.verifyOnPage(`John Smith’s`)
  })

  it('Schedules remain after validation error', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage('John Smith')
    const form = addAppointmentPage.form()

    form.date().click()
    addAppointmentPage.todaysDate().click()
    form.appointmentType().select('ACTI')
    form.location().select('1')

    addAppointmentPage.offenderEvents().contains('Visiting room - Visits - Friends')
    addAppointmentPage.locationEvents().contains('Medical Room1 - Medical - Dentist - Appt details')

    form.recurringNo().click()
    form.comments().type('Test comment')
    form.submitButton().click()

    addAppointmentPage.errorSummary().contains('Select the appointment start time')
    addAppointmentPage.offenderEvents().contains('Visiting room - Visits - Friends')
  })

  it('A user can successfully add a recurring appointment', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage('John Smith')
    const form = addAppointmentPage.form()

    form.appointmentType().select('ACTI')
    form.location().select('1')
    form.startTimeHours().select('23')
    form.startTimeMinutes().select('55')
    form.date().click()
    addAppointmentPage.todaysDate().click()
    form.recurringYes().click()
    form.repeats().select('DAILY')

    addAppointmentPage.lastAppointmentDate().should('not.be.visible')

    form.times().type(3)
    form.comments().type('Test comment')

    addAppointmentPage.lastAppointmentDate().should('be.visible')
    addAppointmentPage
      .lastAppointmentDate()
      .get('#appointment-end-date')
      .contains(moment().add(2, 'days').format('dddd D MMMM YYYY'))

    form.submitButton().click()
    ConfirmSingleAppointmentPage.verifyOnPage(`John Smith’s`)
  })
})
