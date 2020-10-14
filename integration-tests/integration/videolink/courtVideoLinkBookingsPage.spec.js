const CourtVideoLinkBookingsPage = require('../../pages/videolink/courtVideoBookingsPage')

context('A user can view the video link home page', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLoginCourt')
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubCourts')
    cy.task('stubAppointmentsGet', [
      {
        id: 1,
        offenderNo: 'ABC123',
        firstName: 'OFFENDER',
        lastName: 'ONE',
        date: '2020-01-02',
        startTime: '2020-01-02T12:30:00',
        appointmentTypeDescription: 'Medical - Other',
        appointmentTypeCode: 'MEOT',
        locationDescription: 'HEALTH CARE',
        locationId: 123,
        createUserId: 'STAFF_1',
        agencyId: 'MDI',
      },
      {
        id: 2,
        offenderNo: 'ABC456',
        firstName: 'OFFENDER',
        lastName: 'TWO',
        date: '2020-01-02',
        startTime: '2020-01-02T13:30:00',
        endTime: '2020-01-02T14:30:00',
        appointmentTypeDescription: 'Gym - Exercise',
        appointmentTypeCode: 'GYM',
        locationDescription: 'GYM',
        locationId: 456,
        createUserId: 'STAFF_2',
        agencyId: 'MDI',
      },
      {
        id: 3,
        offenderNo: 'ABC789',
        firstName: 'OFFENDER',
        lastName: 'THREE',
        date: '2020-01-02',
        startTime: '2020-01-02T14:30:00',
        endTime: '2020-01-02T15:30:00',
        appointmentTypeDescription: 'Video Link booking',
        appointmentTypeCode: 'VLB',
        locationDescription: 'VCC ROOM',
        locationId: 789,
        createUserId: 'API_PROXY_USER',
        agencyId: 'MDI',
      },
      {
        id: 4,
        offenderNo: 'ABC789',
        firstName: 'OFFENDER',
        lastName: 'FOUR',
        date: '2020-01-02',
        startTime: '2020-01-02T15:30:00',
        endTime: '2020-01-02T16:30:00',
        appointmentTypeDescription: 'Video Link booking',
        appointmentTypeCode: 'VLB',
        locationDescription: 'VCC ROOM',
        locationId: 789,
        createUserId: 'API_PROXY_USER',
        agencyId: 'WWI',
      },
    ])
    cy.task('stubVideoLinkAppointments', {
      appointments: [
        {
          id: 3,
          bookingId: 1,
          appointmentId: 3,
          court: 'Leeds',
          hearingType: 'MAIN',
          madeByTheCourt: true,
          createdByUsername: 'COURT_USER',
        },
        {
          id: 4,
          bookingId: 2,
          appointmentId: 4,
          court: 'A Different Court',
          hearingType: 'MAIN',
          madeByTheCourt: true,
          createdByUsername: 'COURT_USER',
        },
      ],
    })
  })

  it('The results are displayed', () => {
    cy.visit('/videolink/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.noResultsMessage().should('not.be.visible')
    courtVideoBookingsPage
      .searchResultsTableRows()
      .find('td')
      .then($tableCells => {
        cy.get($tableCells)
          .its('length')
          .should('eq', 8)
        expect($tableCells.get(0)).to.contain('14:30 to 15:30')
        expect($tableCells.get(1)).to.contain('Offender Three')
        expect($tableCells.get(2)).to.contain('VCC ROOM')
        expect($tableCells.get(3)).to.contain('Leeds')

        expect($tableCells.get(4)).to.contain('15:30 to 16:30')
        expect($tableCells.get(5)).to.contain('Offender Four')
        expect($tableCells.get(6)).to.contain('VCC ROOM')
        expect($tableCells.get(7)).to.contain('A Different Court')
      })
  })

  it('Returns unsupported courts when Other is selected', () => {
    cy.visit('/videolink/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.courtOption().select('Other')
    courtVideoBookingsPage.submitButton().click()

    courtVideoBookingsPage
      .searchResultsTableRows()
      .find('td')
      .then($tableCells => {
        cy.get($tableCells)
          .its('length')
          .should('eq', 4)
        expect($tableCells.get(0)).to.contain('15:30 to 16:30')
        expect($tableCells.get(1)).to.contain('Offender Four')
        expect($tableCells.get(2)).to.contain('VCC ROOM')
        expect($tableCells.get(3)).to.contain('A Different Court')
      })
  })

  it('The no results message is displayed', () => {
    cy.task('stubAppointmentsGet')
    cy.task('stubVideoLinkAppointments')
    cy.visit('/videolink/bookings')
    const courtVideoBookingsPage = CourtVideoLinkBookingsPage.verifyOnPage()
    courtVideoBookingsPage.noResultsMessage().should('be.visible')
  })
})
