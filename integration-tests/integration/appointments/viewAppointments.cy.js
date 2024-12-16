const ViewAppointmentsPage = require('../../pages/appointments/viewAppointmentsPage')

context('A user can view list of appointments', () => {
  before(() => {})
  beforeEach(() => {
    cy.session('hmpps-session-dev', () => {
      cy.clearCookies()
      cy.task('resetAndStubTokenVerification')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
    })
    cy.task('stubAppointmentTypes', [
      { code: 'ACTI', description: 'Activities' },
      { code: 'VLB', description: 'Video Link Booking' },
    ])
    cy.task('stubAgencyDetails', { agencyId: 'MDI', details: {} })
    cy.task('stubUserEmail', 'ITAG_USER')
    cy.task('stubGetSearchGroups', { id: 'MDI' })
    cy.task('stubGetWhereaboutsAppointments', [
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
    ])
    cy.task('stubGetPrisonVideoLinkSchedule', [
      {
        videoBookingId: 1,
        prisonAppointmentId: 1,
        bookingType: "COURT",
        statusCode: "ACTIVE",
        courtDescription: "Wimbledon",
        prisonerNumber: "ABC789",
        startTime: "14:30",
        endTime: "15:30",
      }
    ])

    cy.task('stubAppointmentLocations', {
      agency: 'MDI',
      locations: [
        {
          locationId: 1,
          locationType: 'VLB',
          description: 'VLB Room 1',
          userDescription: 'VLB Room 1',
          agencyId: 'WWI',
          createdByUsername: 'username1',
        },
        {
          locationId: 2,
          locationType: 'GYM',
          description: 'Gym',
          userDescription: 'Gym',
          agencyId: 'WWI',
        },
      ],
    })

    cy.task('stubPrisonerSearchDetails', [
      {
        cellLocation: '1-1-1',
        prisonerNumber: 'ABC123',
      },
      {
        cellLocation: '2-1-1',
        prisonerNumber: 'ABC456',
      },
      {
        cellLocation: '3-1-1',
        prisonerNumber: 'ABC789',
      },
    ])
  })

  it('A user can see appointments for the date and period', () => {
    cy.visit('/view-all-appointments')
    const viewAppointmentsPage = ViewAppointmentsPage.verifyOnPage()
    viewAppointmentsPage.noResultsMessage().should('not.exist')

    viewAppointmentsPage
      .results()
      .find('td')
      .then(($tableCells) => {
        cy.get($tableCells).its('length').should('eq', 18)
        expect($tableCells.get(0)).to.contain('12:30')
        expect($tableCells.get(1)).to.contain('One, Offender - ABC123')
        expect($tableCells.get(2)).to.contain('1-1-1')
        expect($tableCells.get(3)).to.contain('Medical - Other')
        expect($tableCells.get(4)).to.contain('HEALTH CARE')
        cy.get($tableCells.get(5)).find('a').should('have.attr', 'href').should('include', '/appointment-details/1')

        expect($tableCells.get(6)).to.contain('13:30 to 14:30')
        expect($tableCells.get(7)).to.contain('Two, Offender - ABC456')
        expect($tableCells.get(8)).to.contain('2-1-1')
        expect($tableCells.get(9)).to.contain('Gym - Exercise')
        expect($tableCells.get(10)).to.contain('GYM')
        cy.get($tableCells.get(11)).find('a').should('have.attr', 'href').should('include', '/appointment-details/2')

        expect($tableCells.get(12)).to.contain('14:30 to 15:30')
        expect($tableCells.get(13)).to.contain('Three, Offender - ABC789')
        expect($tableCells.get(14)).to.contain('3-1-1')
        expect($tableCells.get(15)).to.contain('Video Link booking')
        expect($tableCells.get(16)).to.contain('VCC ROOM')
        cy.get($tableCells.get(17)).find('a').should('have.attr', 'href').should('include', '/appointment-details/3')
      })

    const filterForm = viewAppointmentsPage.form()
    filterForm.appointmentType().select('Video Link Booking')
    filterForm.submitButton().click()

    const filteredAppointmentsPage = ViewAppointmentsPage.verifyOnPage()
    filteredAppointmentsPage.noResultsMessage().should('not.exist')

    filteredAppointmentsPage
      .results()
      .find('td')
      .then(($tableCells) => {
        cy.get($tableCells).its('length').should('eq', 6)
        expect($tableCells.get(0)).to.contain('14:30 to 15:30')
        expect($tableCells.get(1)).to.contain('Three, Offender - ABC789')
        expect($tableCells.get(2)).to.contain('3-1-1')
        expect($tableCells.get(3)).to.contain('Video Link booking')
        expect($tableCells.get(4)).to.contain('VCC ROOM')
        cy.get($tableCells.get(5)).find('a').should('have.attr', 'href').should('include', '/appointment-details/3')
      })
  })

  it('A user is presented with the no data message when no data', () => {
    cy.task('stubAppointmentsAtAgency', 'MDI', [])
    cy.task('stubGetWhereaboutsAppointments')
    cy.task('stubGetPrisonVideoLinkSchedule')

    cy.visit('/view-all-appointments')
    const viewAppointmentsPage = ViewAppointmentsPage.verifyOnPage()
    viewAppointmentsPage.noResultsMessage().should('be.visible')
  })
})
