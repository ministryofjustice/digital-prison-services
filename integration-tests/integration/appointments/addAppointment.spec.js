const moment = require('moment')

const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const AddAppointmentPage = require('../../pages/appointments/addAppointmentPage')
const ConfirmSingleAppointmentPage = require('../../pages/appointments/confirmSingleAppointmentPage')
const ConfirmRecurringAppointmentPage = require('../../pages/appointments/confirmRecurringAppointmentPage')
const PrePostAppointmentsPage = require('../../pages/appointments/prePostAppointmentsPage')
const OtherCourtPage = require('../../pages/appointments/otherCourtPage')
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
    const offenderNo = 'A12345'
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
    cy.task('stubAddVideoLinkAppointment')
    cy.task('stubAgencyDetails', { agencyId: 'MDI', details: {} })
    cy.task('stubUserEmail', 'ITAG_USER')

    cy.visit(`/offenders/${offenderNo}/add-appointment`)
  })

  it('A user can successfully add an appointment', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage('John Smith')
    const form = addAppointmentPage.form()

    form.date().type(moment().format('DD/MM/yyyy'))
    addAppointmentPage.activeDate().click()
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
    const today = moment().format('DD/MM/yyyy')
    const addAppointmentPage = AddAppointmentPage.verifyOnPage('John Smith')
    const form = addAppointmentPage.form()

    form.date().type(today)
    addAppointmentPage.activeDate().click()

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
    form.date().type(moment().format('DD/MM/yyyy'))
    addAppointmentPage.activeDate().click()
    form.recurringYes().click()
    form.repeats().select('DAILY')

    addAppointmentPage.lastAppointmentDate().should('not.be.visible')

    form.times().type(3)
    form.comments().type('Test comment')

    addAppointmentPage.lastAppointmentDate().should('be.visible')
    addAppointmentPage
      .lastAppointmentDate()
      .get('#appointment-end-date')
      .contains(
        moment()
          .add(2, 'days')
          .format('dddd D MMMM YYYY')
      )

    form.submitButton().click()
    ConfirmSingleAppointmentPage.verifyOnPage(`John Smith’s`)
  })

  it('A user can successfully add a video link booking', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage('John Smith')
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
    addAppointmentPage.activeDate().click()
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

  it('Correct validation errors for video link bookings', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage('John Smith')
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
    addAppointmentPage.activeDate().click()
    form.submitButton().click()

    const prePostAppointmentsPage = PrePostAppointmentsPage.verifyOnPage()
    const prePostForm = prePostAppointmentsPage.form()

    prePostForm.submitButton().click()
    prePostAppointmentsPage
      .errorSummary()
      .find('li')
      .then($errorItems => {
        expect($errorItems.get(0).innerText).to.contain('Select a room for the pre-court hearing briefing')
        expect($errorItems.get(1).innerText).to.contain('Select a room for the post-court hearing briefing')
        expect($errorItems.get(2).innerText).to.contain('Select which court the hearing is for')
      })
  })

  it('Should allow the user to enter custom court entry', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage('John Smith')
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
    addAppointmentPage.activeDate().click()
    form.submitButton().click()

    const prePostAppointmentsPage = PrePostAppointmentsPage.verifyOnPage()
    const prePostForm = prePostAppointmentsPage.form()

    prePostForm.preAppointmentLocation().select('1')
    prePostForm.preAppointmentDuration().select('20')
    prePostForm.postAppointmentNo().click()
    prePostForm.court().select('Other')
    prePostForm.submitButton().click()

    const otherCourtPage = OtherCourtPage.verifyOnPage()
    const otherCourtForm = otherCourtPage.form()

    otherCourtForm.otherCourt().type('test')
    otherCourtForm.submitButton().click()

    const confirmVideoLinkPrisonPage = ConfirmVideoLinkPrisonPage.verifyOnPage()
    confirmVideoLinkPrisonPage.courtLocation().contains('test')
  })

  it('Should display correct error messages on other court form page', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage('John Smith')
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
    addAppointmentPage.activeDate().click()
    form.submitButton().click()

    const prePostAppointmentsPage = PrePostAppointmentsPage.verifyOnPage()
    const prePostForm = prePostAppointmentsPage.form()

    prePostForm.preAppointmentLocation().select('1')
    prePostForm.preAppointmentDuration().select('20')
    prePostForm.postAppointmentNo().click()
    prePostForm.court().select('Other')
    prePostForm.submitButton().click()

    const otherCourtPage = OtherCourtPage.verifyOnPage()
    const otherCourtForm = otherCourtPage.form()

    otherCourtForm.submitButton().click()

    otherCourtPage
      .errorSummary()
      .find('li')
      .then($errorItems => {
        expect($errorItems.get(0).innerText).to.contain('Enter the name of the court')
      })
  })

  it('Should retain previously entered information', () => {
    const addAppointmentPage = AddAppointmentPage.verifyOnPage('John Smith')
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
    addAppointmentPage.activeDate().click()
    form.submitButton().click()

    const prePostAppointmentsPage = PrePostAppointmentsPage.verifyOnPage()
    const prePostForm = prePostAppointmentsPage.form()

    prePostForm.preAppointmentLocation().select('1')
    prePostForm.preAppointmentDuration().select('20')
    prePostForm.postAppointmentNo().click()
    prePostForm.court().select('Other')
    prePostForm.submitButton().click()

    const otherCourtPage = OtherCourtPage.verifyOnPage()
    const otherCourtForm = otherCourtPage.form()

    otherCourtForm.cancelButton().click()
    const returnPrePostAppointmentsPage = PrePostAppointmentsPage.verifyOnPage()

    returnPrePostAppointmentsPage
      .form()
      .preAppointmentYes()
      .should('be.checked')
    returnPrePostAppointmentsPage
      .form()
      .preAppointmentLocation()
      .contains('1')
    returnPrePostAppointmentsPage
      .form()
      .preAppointmentDuration()
      .contains('20')
    returnPrePostAppointmentsPage
      .form()
      .postAppointmentNo()
      .should('be.checked')
  })
})
