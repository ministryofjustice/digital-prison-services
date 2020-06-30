const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const AddCourtAppointmentPage = require('../../pages/appointments/addCourtAppointmentPage')
const ConfirmVideoLinkCourtPage = require('../../pages/appointments/confirmVideoLinkCourtPage')
const ConfirmVideoLinkPrisonPage = require('../../pages/appointments/confirmVideoLinkPrisonPage')
const NoAvailabilityPage = require('../../pages/appointments/noAvailabilityPage')
const SelectCourtAppointmentCourtPage = require('../../pages/appointments/selectCourtAppointmentCourtPage')
const SelectCourtAppointmentRoomsPage = require('../../pages/appointments/selectCourtAppointmentRoomsPage')

context('A user can add a video link', () => {
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
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    cy.task('stubAppointmentTypes', [
      { code: 'ACTI', description: 'Activities' },
      { code: 'VLB', description: 'Video Link Booking' },
    ])
    cy.task('stubCourts')
    cy.task('stubAddVideoLinkAppointment')
    cy.task('stubAgencyDetails', {
      agencyId: 'MDI',
      details: { agencyId: 'MDI', description: 'Moorland', agencyType: 'INST' },
    })
    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubAppointmentLocations', {
      agency: 'MDI',
      locations: [
        {
          locationId: 1,
          locationType: 'VIDE',
          description: 'Room 1',
          userDescription: 'Room 1',
          agencyId: 'MDI',
        },
        {
          locationId: 2,
          locationType: 'VIDE',
          description: 'Room 2',
          userDescription: 'Room 2',
          agencyId: 'MDI',
        },
        {
          locationId: 3,
          locationType: 'VIDE',
          description: 'Room 3',
          userDescription: 'Room 3',
          agencyId: 'MDI',
        },
      ],
    })

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
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
          locationId: 1,
        },
      ],
      location: 1,
      date: moment()
        .add(1, 'days')
        .format('yyyy-MM-DD'),
    })

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
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
          locationId: 2,
        },
      ],
      location: 2,
      date: moment()
        .add(1, 'days')
        .format('yyyy-MM-DD'),
    })

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
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
          locationId: 3,
        },
      ],
      location: 3,
      date: moment()
        .add(1, 'days')
        .format('yyyy-MM-DD'),
    })

    cy.visit(`/MDI/offenders/${offenderNo}/add-court-appointment`)
  })

  it('A user is taken to select court and rooms pages and then to prison video link confirm', () => {
    const addCourtAppointmentPage = AddCourtAppointmentPage.verifyOnPage()
    const addAppointmentForm = addCourtAppointmentPage.form()
    addAppointmentForm.date().type(
      moment()
        .add(1, 'days')
        .format('DD/MM/YYYY')
    )

    addCourtAppointmentPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('10')
    addAppointmentForm.startTimeMinutes().select('55')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('55')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const selectCourtAppointmentCourtPage = SelectCourtAppointmentCourtPage.verifyOnPage()
    selectCourtAppointmentCourtPage.offenderName().contains('John Smith')
    selectCourtAppointmentCourtPage.prison().contains('Moorland')
    selectCourtAppointmentCourtPage.startTime().contains('10:55')
    selectCourtAppointmentCourtPage.endTime().contains('11:55')
    selectCourtAppointmentCourtPage.date().contains(
      moment()
        .add(1, 'days')
        .format('D MMMM YYYY')
    )
    selectCourtAppointmentCourtPage.preTime().contains('10:35 to 10:55')
    selectCourtAppointmentCourtPage.postTime().contains('11:55 to 12:15')

    const selectCourtForm = selectCourtAppointmentCourtPage.form()
    selectCourtForm.court().select('London')
    selectCourtForm.submitButton().click()

    const selectCourtAppointmentRoomsPage = SelectCourtAppointmentRoomsPage.verifyOnPage()
    const selectRoomsForm = selectCourtAppointmentRoomsPage.form()
    selectRoomsForm.selectPreAppointmentLocation().select('1')
    selectRoomsForm.selectMainAppointmentLocation().select('2')
    selectRoomsForm.selectPostAppointmentLocation().select('3')
    selectRoomsForm.submitButton().click()

    const confirmVideoLinkPrisonPage = ConfirmVideoLinkPrisonPage.verifyOnPage()
    confirmVideoLinkPrisonPage.offenderName().contains('John Smith')
    confirmVideoLinkPrisonPage.prison().contains('Moorland')
    confirmVideoLinkPrisonPage.room().contains('Room 2')
    confirmVideoLinkPrisonPage.startTime().contains('10:55')
    confirmVideoLinkPrisonPage.endTime().contains('11:55')
    confirmVideoLinkPrisonPage.date().contains(
      moment()
        .add(1, 'days')
        .format('D MMMM YYYY')
    )
    confirmVideoLinkPrisonPage.legalBriefingBefore().contains('10:35 to 10:55')
    confirmVideoLinkPrisonPage.legalBriefingAfter().contains('11:55 to 12:15')
    confirmVideoLinkPrisonPage.courtLocation().contains('London')
  })

  it('A user is taken to select court and rooms pages and then to court video link confirm', () => {
    // This is a bit of a cheat, as we only check the user role.
    // Saves dealing with logging out and logging back in in the setup.
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI', roles: [{ roleCode: 'VIDEO_LINK_COURT_USER' }] })
    const addCourtAppointmentPage = AddCourtAppointmentPage.verifyOnPage()
    const addAppointmentForm = addCourtAppointmentPage.form()
    addAppointmentForm.date().type(
      moment()
        .add(1, 'days')
        .format('DD/MM/YYYY')
    )

    addCourtAppointmentPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('10')
    addAppointmentForm.startTimeMinutes().select('55')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('55')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const selectCourtAppointmentCourtPage = SelectCourtAppointmentCourtPage.verifyOnPage()
    selectCourtAppointmentCourtPage.offenderName().contains('John Smith')
    selectCourtAppointmentCourtPage.prison().contains('Moorland')
    selectCourtAppointmentCourtPage.startTime().contains('10:55')
    selectCourtAppointmentCourtPage.endTime().contains('11:55')
    selectCourtAppointmentCourtPage.date().contains(
      moment()
        .add(1, 'days')
        .format('D MMMM YYYY')
    )
    selectCourtAppointmentCourtPage.preTime().contains('10:35 to 10:55')
    selectCourtAppointmentCourtPage.postTime().contains('11:55 to 12:15')

    const selectCourtForm = selectCourtAppointmentCourtPage.form()
    selectCourtForm.court().select('London')
    selectCourtForm.submitButton().click()

    const selectCourtAppointmentRoomsPage = SelectCourtAppointmentRoomsPage.verifyOnPage()
    const selectRoomsForm = selectCourtAppointmentRoomsPage.form()
    selectRoomsForm.selectPreAppointmentLocation().select('1')
    selectRoomsForm.selectMainAppointmentLocation().select('2')
    selectRoomsForm.selectPostAppointmentLocation().select('3')
    selectRoomsForm.submitButton().click()

    const confirmVideoLinkCourtPage = ConfirmVideoLinkCourtPage.verifyOnPage()
    confirmVideoLinkCourtPage.offenderName().contains('John Smith')
    confirmVideoLinkCourtPage.prison().contains('Moorland')
    confirmVideoLinkCourtPage.room().contains('Room 2')
    confirmVideoLinkCourtPage.startTime().contains('10:55')
    confirmVideoLinkCourtPage.endTime().contains('11:55')
    confirmVideoLinkCourtPage.date().contains(
      moment()
        .add(1, 'days')
        .format('D MMMM YYYY')
    )
    confirmVideoLinkCourtPage.legalBriefingBefore().contains('10:35 to 10:55')
    confirmVideoLinkCourtPage.legalBriefingAfter().contains('11:55 to 12:15')
    confirmVideoLinkCourtPage.courtLocation().contains('London')
  })

  it('A user is redirected to no availability for today page', () => {
    cy.task('stubAppointmentLocations', {
      agency: 'MDI',
      locations: [
        {
          locationId: 1,
          locationType: 'VIDE',
          description: 'Room 1',
          userDescription: 'Room 1',
          agencyId: 'MDI',
        },
        {
          locationId: 2,
          locationType: 'VIDE',
          description: 'Room 2',
          userDescription: 'Room 2',
          agencyId: 'MDI',
        },
      ],
    })
    const tomorrow = moment().add(1, 'days')
    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
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
          startTime: tomorrow
            .hours(8)
            .minutes(0)
            .format('YYYY-MM-DDTHH:mm:ss'),
          endTime: tomorrow
            .hours(18)
            .minutes(0)
            .format('YYYY-MM-DDTHH:mm:ss'),
          locationId: 1,
        },
      ],
      location: 1,
      date: tomorrow.format('yyyy-MM-DD'),
    })

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
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
          startTime: tomorrow
            .hours(8)
            .minutes(0)
            .format('YYYY-MM-DDTHH:mm:ss'),
          endTime: tomorrow
            .hours(18)
            .minutes(0)
            .format('YYYY-MM-DDTHH:mm:ss'),
          locationId: 2,
        },
      ],
      location: 2,
      date: tomorrow.format('yyyy-MM-DD'),
    })

    const addCourtAppointmentPage = AddCourtAppointmentPage.verifyOnPage()
    const addAppointmentForm = addCourtAppointmentPage.form()
    addAppointmentForm.date().type(tomorrow.format('DD/MM/YYYY'))

    addCourtAppointmentPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('10')
    addAppointmentForm.startTimeMinutes().select('55')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('55')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const noAvailabilityPage = NoAvailabilityPage.verifyOnPage()
    noAvailabilityPage.info().contains(`There are no bookings available on ${tomorrow.format('dddd D MMMM YYYY')}`)
  })

  it('A user is redirected to no availability for time page', () => {
    cy.task('stubAppointmentLocations', {
      agency: 'MDI',
      locations: [
        {
          locationId: 1,
          locationType: 'VIDE',
          description: 'Room 1',
          userDescription: 'Room 1',
          agencyId: 'MDI',
        },
        {
          locationId: 2,
          locationType: 'VIDE',
          description: 'Room 2',
          userDescription: 'Room 2',
          agencyId: 'MDI',
        },
      ],
    })
    const tomorrow = moment().add(1, 'days')
    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
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
          startTime: tomorrow
            .hours(8)
            .minutes(0)
            .format('YYYY-MM-DDTHH:mm:ss'),
          endTime: tomorrow
            .hours(15)
            .minutes(0)
            .format('YYYY-MM-DDTHH:mm:ss'),
          locationId: 1,
        },
      ],
      location: 1,
      date: tomorrow.format('yyyy-MM-DD'),
    })

    cy.task('stubAppointmentsAtAgencyLocation', {
      agency: 'MDI',
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
          startTime: tomorrow
            .hours(8)
            .minutes(0)
            .format('YYYY-MM-DDTHH:mm:ss'),
          endTime: tomorrow
            .hours(15)
            .minutes(0)
            .format('YYYY-MM-DDTHH:mm:ss'),
          locationId: 2,
        },
      ],
      location: 2,
      date: tomorrow.format('yyyy-MM-DD'),
    })

    const addCourtAppointmentPage = AddCourtAppointmentPage.verifyOnPage()
    const addAppointmentForm = addCourtAppointmentPage.form()
    addAppointmentForm.date().type(tomorrow.format('DD/MM/YYYY'))

    addCourtAppointmentPage.activeDate().click()
    addAppointmentForm.startTimeHours().select('10')
    addAppointmentForm.startTimeMinutes().select('55')
    addAppointmentForm.endTimeHours().select('11')
    addAppointmentForm.endTimeMinutes().select('55')
    addAppointmentForm.preAppointmentRequiredYes().click()
    addAppointmentForm.postAppointmentRequiredYes().click()
    addAppointmentForm.submitButton().click()

    const noAvailabilityPage = NoAvailabilityPage.verifyOnPage()
    noAvailabilityPage
      .info()
      .contains(`There are no bookings available on ${tomorrow.format('dddd D MMMM YYYY')} between 10:35 and 12:15.`)
  })
})
