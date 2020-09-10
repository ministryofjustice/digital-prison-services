const moment = require('moment')
const AddBulkAppointmentsPage = require('../../pages/appointments/addBulkAppointmentsPage')
const BulkAppointmentsAddedPage = require('../../pages/appointments/bulkAppointmentsAddedPage')
const BulkAppointmentsClashesPage = require('../../pages/appointments/bulkAppointmentsClashesPage')
const BulkAppointmentsConfirmPage = require('../../pages/appointments/bulkAppointmentsConfirmPage')
const BulkAppointmentsInvalidNumbersPage = require('../../pages/appointments/bulkAppointmentsInvalidNumbersPage')
const BulkAppointmentsNotAddedPage = require('../../pages/appointments/bulkAppointmentsNotAddedPage')
const BulkAppointmentUploadCSVPage = require('../../pages/appointments/bulkAppointmentsUploadCSVPage')

context('A user can add a bulk appointment', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    const offenderNo = 'A12345'
    cy.task('stubAppointmentTypes', [
      { code: 'ACTI', description: 'Activities' },
      { code: 'VLB', description: 'Video Link Booking' },
    ])
    cy.task('stubPostAppointments')
    cy.task('stubSchedules', {
      agency: 'MDI',
      location: 1,
      date: moment()
        .add(1, 'days')
        .format('yyyy-MM-DD'),
      appointments: [],
      visits: [],
      activities: [],
    })
    cy.task('stubLocation', { locationId: 123456 })
    cy.task('stubAppointmentLocations', {
      agency: 'MDI',
      locations: [
        { locationId: 1, locationType: 'ADJU', description: 'Adjudication', userDescription: 'Adj', agencyId: 'MDI' },
      ],
    })
    cy.task('stubBookingOffenders', [
      { bookingId: 1, offenderNo, firstName: 'John', lastName: 'Doe', agencyId: 'MDI', assignedLivingUnitId: 123456 },
    ])
    cy.visit('/bulk-appointments/add-appointment-details')
  })

  it('A user can add a non reoccurring bulk appointment with the same start time', () => {
    const addBulkAppointmentsPage = AddBulkAppointmentsPage.verifyOnPage()
    const form = addBulkAppointmentsPage.form()
    addBulkAppointmentsPage.enterBasicAppointmentDetails(form)
    form.sameTimeAppointmentsYes().click()
    form.startTimeHours().select('10')
    form.startTimeMinutes().select('10')
    form.recurringNo().click()
    form.comments().type('Test comment.')
    form.submitButton().click()

    const bulkAppointmentsUploadCSVPage = BulkAppointmentUploadCSVPage.verifyOnPage()
    const uploadForm = bulkAppointmentsUploadCSVPage.form()
    cy.get('#file').attachFile('resources/offenders-for-appointments.csv')
    uploadForm.submitButton().click()

    const bulkAppointmentsConfirmPage = BulkAppointmentsConfirmPage.verifyOnPage()
    bulkAppointmentsConfirmPage.appointmentType().contains('Activities')
    bulkAppointmentsConfirmPage.appointmentLocation().contains('Adj')
    bulkAppointmentsConfirmPage.appointmentStartDate().contains(
      moment()
        .add(10, 'days')
        .format('dddd D MMMM YYYY')
    )
    bulkAppointmentsConfirmPage.appointmentStartTime().contains('10:10')
    bulkAppointmentsConfirmPage.prisonersFound().contains('Doe John')
    bulkAppointmentsConfirmPage.submitButton().click()

    BulkAppointmentsAddedPage.verifyOnPage()
  })

  it('A user can add a non reoccurring bulk appointment with different start times', () => {
    const addBulkAppointmentsPage = AddBulkAppointmentsPage.verifyOnPage()
    const form = addBulkAppointmentsPage.form()
    addBulkAppointmentsPage.enterBasicAppointmentDetails(form)
    form.sameTimeAppointmentsNo().click()
    form.recurringNo().click()
    form.comments().type('Test comment.')
    form.submitButton().click()

    const bulkAppointmentsUploadCSVPage = BulkAppointmentUploadCSVPage.verifyOnPage()
    const uploadForm = bulkAppointmentsUploadCSVPage.form()
    cy.get('#file').attachFile('resources/offenders-for-appointments.csv')
    uploadForm.submitButton().click()

    const bulkAppointmentsConfirmPage = BulkAppointmentsConfirmPage.verifyOnPage()
    bulkAppointmentsConfirmPage.appointmentType().contains('Activities')
    bulkAppointmentsConfirmPage.appointmentLocation().contains('Adj')
    bulkAppointmentsConfirmPage.appointmentStartDate().contains(
      moment()
        .add(10, 'days')
        .format('dddd D MMMM YYYY')
    )
    bulkAppointmentsConfirmPage.prisonersFound().contains('Doe John')
    const timesForm = bulkAppointmentsConfirmPage.form('A12345')
    timesForm.startTimeHours().select('10')
    timesForm.startTimeMinutes().select('30')
    timesForm.endTimeHours().select('11')
    timesForm.endTimeMinutes().select('30')
    bulkAppointmentsConfirmPage.submitButton().click()

    BulkAppointmentsAddedPage.verifyOnPage()
  })

  it('A user can add a recurring bulk appointment', () => {
    const addBulkAppointmentsPage = AddBulkAppointmentsPage.verifyOnPage()
    const form = addBulkAppointmentsPage.form()
    addBulkAppointmentsPage.enterBasicAppointmentDetails(form)
    form.sameTimeAppointmentsYes().click()
    form.startTimeHours().select('10')
    form.startTimeMinutes().select('10')
    form.recurringYes().click()
    form.repeats().select('WEEKLY')
    form.times().type(5)
    form.comments().type('Test comment.')
    form.submitButton().click()

    const bulkAppointmentsUploadCSVPage = BulkAppointmentUploadCSVPage.verifyOnPage()
    const uploadForm = bulkAppointmentsUploadCSVPage.form()
    cy.get('#file').attachFile('resources/offenders-for-appointments.csv')
    uploadForm.submitButton().click()

    const bulkAppointmentsConfirmPage = BulkAppointmentsConfirmPage.verifyOnPage()
    bulkAppointmentsConfirmPage.appointmentType().contains('Activities')
    bulkAppointmentsConfirmPage.appointmentLocation().contains('Adj')
    bulkAppointmentsConfirmPage.appointmentStartDate().contains(
      moment()
        .add(10, 'days')
        .format('dddd D MMMM YYYY')
    )
    bulkAppointmentsConfirmPage.appointmentStartTime().contains('10:10')
    bulkAppointmentsConfirmPage.prisonersFound().contains('Doe John')
    bulkAppointmentsConfirmPage.appointmentsHowOften().contains('Weekly')
    bulkAppointmentsConfirmPage.appointmentsOccurrences().contains('5')
    bulkAppointmentsConfirmPage.appointmentsEndDate().contains(
      moment()
        .add(10, 'days')
        .add(4, 'w')
        .format('dddd D MMMM YYYY')
    )
    bulkAppointmentsConfirmPage.submitButton().click()

    BulkAppointmentsAddedPage.verifyOnPage()
  })

  it('A user can add no appointments when all have been removed due clashes', () => {
    cy.task('stubSchedules', {
      agency: 'MDI',
      location: 1,
      date: moment()
        .add(10, 'days')
        .format('yyyy-MM-DD'),
      appointments: [
        {
          offenderNo: 'A12345',
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
          offenderNo: 'A12345',
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
          offenderNo: 'A12345',
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

    const addBulkAppointmentsPage = AddBulkAppointmentsPage.verifyOnPage()
    const form = addBulkAppointmentsPage.form()
    addBulkAppointmentsPage.enterBasicAppointmentDetails(form)
    form.sameTimeAppointmentsYes().click()
    form.startTimeHours().select('10')
    form.startTimeMinutes().select('10')
    form.recurringNo().click()
    form.comments().type('Test comment.')
    form.submitButton().click()

    const bulkAppointmentsUploadCSVPage = BulkAppointmentUploadCSVPage.verifyOnPage()
    const uploadForm = bulkAppointmentsUploadCSVPage.form()
    cy.get('#file').attachFile('resources/offenders-for-appointments.csv')
    uploadForm.submitButton().click()

    const bulkAppointmentsConfirmPage = BulkAppointmentsConfirmPage.verifyOnPage()
    bulkAppointmentsConfirmPage.submitButton().click()

    const bulkAppointmentsClashesPage = BulkAppointmentsClashesPage.verifyOnPage()
    bulkAppointmentsClashesPage.prisonersWithClashes().contains('Medical Room1 - Medical - Dentist - 15:30')
    bulkAppointmentsClashesPage.prisonersWithClashes().contains('Visiting room - Visits - 18:00 to 18:30')
    bulkAppointmentsClashesPage.prisonersWithClashes().contains('Doe')
    const clashesForm = bulkAppointmentsClashesPage.form('A12345')
    clashesForm.offenderNo().check()
    clashesForm.submitButton().click()

    BulkAppointmentsNotAddedPage.verifyOnPage()
  })

  it('A user can add no appointments when all offender numbers are invalid', () => {
    const addBulkAppointmentsPage = AddBulkAppointmentsPage.verifyOnPage()
    const form = addBulkAppointmentsPage.form()
    addBulkAppointmentsPage.enterBasicAppointmentDetails(form)
    form.sameTimeAppointmentsYes().click()
    form.startTimeHours().select('10')
    form.startTimeMinutes().select('10')
    form.recurringNo().click()
    form.comments().type('Test comment.')
    form.submitButton().click()

    const bulkAppointmentsUploadCSVPage = BulkAppointmentUploadCSVPage.verifyOnPage()
    const uploadForm = bulkAppointmentsUploadCSVPage.form()
    cy.get('#file').attachFile('resources/offenders-for-appointments-invalid.csv')
    uploadForm.submitButton().click()

    const bulkAppointmentsNotAddedPage = BulkAppointmentsNotAddedPage.verifyOnPage()
    bulkAppointmentsNotAddedPage.notAddedMessage().contains('This might be because the prison numbers')
  })

  it('A user can upload invalid prisoner numbers and be warned', () => {
    const addBulkAppointmentsPage = AddBulkAppointmentsPage.verifyOnPage()
    const form = addBulkAppointmentsPage.form()
    addBulkAppointmentsPage.enterBasicAppointmentDetails(form)
    form.sameTimeAppointmentsYes().click()
    form.startTimeHours().select('10')
    form.startTimeMinutes().select('10')
    form.recurringNo().click()
    form.comments().type('Test comment.')
    form.submitButton().click()

    const bulkAppointmentsUploadCSVPage = BulkAppointmentUploadCSVPage.verifyOnPage()
    const uploadForm = bulkAppointmentsUploadCSVPage.form()
    cy.get('#file').attachFile('resources/offenders-for-appointments-with-missing.csv')
    uploadForm.submitButton().click()

    const bulkAppointmentsInvalidNumbersPage = BulkAppointmentsInvalidNumbersPage.verifyOnPage()
    bulkAppointmentsInvalidNumbersPage.prisonersNotFound().contains('B12345')
    bulkAppointmentsInvalidNumbersPage.continueCTA().click()

    const bulkAppointmentsConfirmPage = BulkAppointmentsConfirmPage.verifyOnPage()
    bulkAppointmentsConfirmPage.appointmentType().contains('Activities')
    bulkAppointmentsConfirmPage.appointmentLocation().contains('Adj')
    bulkAppointmentsConfirmPage.appointmentStartDate().contains(
      moment()
        .add(10, 'days')
        .format('dddd D MMMM YYYY')
    )
    bulkAppointmentsConfirmPage.appointmentStartTime().contains('10:10')
    bulkAppointmentsConfirmPage.prisonersFound().contains('Doe John')
    bulkAppointmentsConfirmPage.submitButton().click()

    BulkAppointmentsAddedPage.verifyOnPage()
  })

  it('A user can upload duplicate prisoner numbers and be warned', () => {
    const addBulkAppointmentsPage = AddBulkAppointmentsPage.verifyOnPage()
    const form = addBulkAppointmentsPage.form()
    addBulkAppointmentsPage.enterBasicAppointmentDetails(form)
    form.sameTimeAppointmentsYes().click()
    form.startTimeHours().select('10')
    form.startTimeMinutes().select('10')
    form.recurringNo().click()
    form.comments().type('Test comment.')
    form.submitButton().click()

    const bulkAppointmentsUploadCSVPage = BulkAppointmentUploadCSVPage.verifyOnPage()
    const uploadForm = bulkAppointmentsUploadCSVPage.form()
    cy.get('#file').attachFile('resources/offenders-for-appointments-with-duplicates.csv')
    uploadForm.submitButton().click()

    const bulkAppointmentsInvalidNumbersPage = BulkAppointmentsInvalidNumbersPage.verifyOnPage()
    bulkAppointmentsInvalidNumbersPage.prisonersDuplicated().contains('A12345')
    bulkAppointmentsInvalidNumbersPage.continueCTA().click()

    const bulkAppointmentsConfirmPage = BulkAppointmentsConfirmPage.verifyOnPage()
    bulkAppointmentsConfirmPage.appointmentType().contains('Activities')
    bulkAppointmentsConfirmPage.appointmentLocation().contains('Adj')
    bulkAppointmentsConfirmPage.appointmentStartDate().contains(
      moment()
        .add(10, 'days')
        .format('dddd D MMMM YYYY')
    )
    bulkAppointmentsConfirmPage.appointmentStartTime().contains('10:10')
    bulkAppointmentsConfirmPage.prisonersFound().contains('Doe John')
    bulkAppointmentsConfirmPage.submitButton().click()

    BulkAppointmentsAddedPage.verifyOnPage()
  })
})
