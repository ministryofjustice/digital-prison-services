const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

const testAppointment = {
  appointment: {
    offenderNo: 'ABC123',
    id: 1,
    agencyId: 'MDI',
    locationId: 2,
    appointmentTypeCode: 'GYM',
    startTime: '2021-05-20T13:00:00',
    createUserId: 'TEST_USER',
  },
  recurring: null,
  videoLinkBooking: null,
}

context('Appointment details page', () => {
  before(() => {})

  beforeEach(() => {
    cy.session('hmpps-session-dev', () => {
      cy.clearCookies()
      cy.task('resetAndStubTokenVerification')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: ['ROLE_DELETE_A_PRISONERS_APPOINTMENT'] })
      cy.signIn()
    })

    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    cy.task('stubAppointmentLocations', {
      agency: 'MDI',
      locations: [
        { userDescription: 'VCC Room 1', locationId: 1 },
        { userDescription: 'Gymnasium', locationId: 2 },
        { userDescription: 'VCC Room 2', locationId: 3 },
      ],
    })
    cy.task('stubAppointmentTypes', [
      { code: 'GYM', description: 'Gym' },
      { description: 'Video link booking', code: 'VLB' },
    ])
    cy.task('stubGetAppointment', {
      id: 1,
      appointment: testAppointment,
    })
    cy.task('stubGetStaffDetails', {
      staffId: 'TEST_USER',
      response: { firstName: 'Test', lastName: 'User' },
    })
  })

  it('Should show the correct information', () => {
    cy.visit('/appointment-details/1')

    cy.get('h1').should('contain', 'John Smith’s appointment details')
    cy.get('[data-test="prisoner-number"]').should('contain', 'ABC123')
    cy.get('.qa-type-value').should('contain', 'Gym')
    cy.get('.qa-location-value').should('contain', 'Gymnasium')
    cy.get('.qa-date-value').should('contain', '20 May 2021')
    cy.get('.qa-startTime-value').should('contain', '13:00')
    cy.get('.qa-endTime-value').should('contain', 'Not entered')
    cy.get('.qa-preCourtHearingBriefing-value').should('not.exist')
    cy.get('.qa-postCourtHearingBriefing-value').should('not.exist')
    cy.get('.qa-courtLocation-value').should('not.exist')
    cy.get('.qa-recurring-value').should('contain', 'No')
    cy.get('.qa-repeats-value').should('not.exist')
    cy.get('.qa-lastAppointment-value').should('not.exist')
    cy.get('.qa-comments-value').should('contain', 'Not entered')
    cy.get('.qa-addedBy-value').should('contain', 'Test User')
    cy.get('[data-test="return-link"]').should('have.attr', 'href').should('include', '/view-all-appointments')
  })

  it('Should show delete button and go to the confirm deletion page when clicked', () => {
    cy.visit('/appointment-details/1')

    cy.get('[role="button"]').should('contain', 'Delete appointment')
    cy.get('[role="button"]').click()

    cy.url().should('include', '/appointment-details/1/confirm-deletion')
  })

  context('when it is a recurring appointment', () => {
    beforeEach(() => {
      cy.task('stubGetAppointment', {
        id: 1,
        appointment: {
          ...testAppointment,
          recurring: {
            id: 100,
            repeatPeriod: 'WEEKLY',
            count: 10,
            startTime: testAppointment.appointment.startTime,
          },
        },
      })
    })

    it('Should show the correct information', () => {
      cy.visit('/appointment-details/1')

      cy.get('h1').should('contain', 'John Smith’s appointment details')
      cy.get('[data-test="prisoner-number"]').should('contain', 'ABC123')
      cy.get('.qa-type-value').should('contain', 'Gym')
      cy.get('.qa-location-value').should('contain', 'Gymnasium')
      cy.get('.qa-date-value').should('contain', '20 May 2021')
      cy.get('.qa-startTime-value').should('contain', '13:00')
      cy.get('.qa-endTime-value').should('contain', 'Not entered')
      cy.get('.qa-preCourtHearingBriefing-value').should('not.exist')
      cy.get('.qa-postCourtHearingBriefing-value').should('not.exist')
      cy.get('.qa-courtLocation-value').should('not.exist')
      cy.get('.qa-recurring-value').should('contain', 'Yes')
      cy.get('.qa-repeats-value').should('contain', 'Weekly')
      cy.get('.qa-lastAppointment-value').should('contain', '22 July 2021')
      cy.get('.qa-comments-value').should('contain', 'Not entered')
      cy.get('.qa-addedBy-value').should('contain', 'Test User')
      cy.get('[data-test="return-link"]').should('have.attr', 'href').should('include', '/view-all-appointments')
    })
  })

  context('when it is a video link booking appointment', () => {
    beforeEach(() => {
      cy.task('stubGetAppointment', {
        id: 1,
        appointment: {
          appointment: {
            ...testAppointment.appointment,
            locationId: 1,
            appointmentTypeCode: 'VLB',
            startTime: '2021-05-20T13:00:00',
            endTime: '2021-05-20T14:00:00',
            comment: 'Test appointment comments',
          }
        },
      })
      cy.task('stubNomisLocationMapping', { nomisLocationId: 1, dpsLocationId: 'abc-123' })
      cy.task('stubGetLocationById', { id: 'abc-123', response: { key: 'location-key' } })
      cy.task('stubGetLocationByKey', { key: 'location-key', response: { id: 'abc-123' } })
      cy.task('matchAppointmentToVideoLinkBooking', {
        videoLinkBookingId: 1,
        bookingType: 'COURT',
        prisonAppointments: [
          { appointmentType: 'VLB_COURT_PRE', prisonLocKey: 'location-key', startTime: '12:45', endTime: '13:00' },
          { appointmentType: 'VLB_COURT_MAIN', prisonLocKey: 'location-key', startTime: '13:00', endTime: '14:00'  },
          { appointmentType: 'VLB_COURT_POST', prisonLocKey: 'location-key', startTime: '14:00', endTime: '14:15'  },
        ],
        courtDescription: 'Nottingham Justice Centre',
        courtHearingTypeDescription: 'Appeal',
      })
    })

    it('Should show the correct information information', () => {
      cy.visit('/appointment-details/1')

      cy.get('h1').should('contain', 'John Smith’s appointment details')
      cy.get('[data-test="prisoner-number"]').should('contain', 'ABC123')
      cy.get('.qa-type-value').should('contain', 'Video link booking')
      cy.get('.qa-location-value').should('contain', 'VCC Room 1')
      cy.get('.qa-date-value').should('contain', '20 May 2021')
      cy.get('.qa-startTime-value').should('contain', '13:00')
      cy.get('.qa-endTime-value').should('contain', '14:00')
      cy.get('.qa-preCourtHearingBriefing-value').should('contain', 'VCC Room 1 - 12:45 to 13:00')
      cy.get('.qa-postCourtHearingBriefing-value').should('contain', 'VCC Room 1 - 14:00 to 14:15')
      cy.get('.qa-courtLocation-value').should('contain', 'Nottingham Justice Centre')
      cy.get('.qa-recurring-value').should('not.exist')
      cy.get('.qa-repeats-value').should('not.exist')
      cy.get('.qa-lastAppointment-value').should('not.exist')
      cy.get('.qa-comments-value').should('contain', 'Test appointment comments')
      cy.get('.qa-addedBy-value').should('contain', 'Court')
      cy.get('[data-test="return-link"]').should('have.attr', 'href').should('include', '/view-all-appointments')
    })
  })
})

context('when the user does not have the roles', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })

  beforeEach(() => {
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)

    cy.task('stubAppointmentLocations', {
      agency: 'MDI',
      locations: [
        { userDescription: 'VCC Room 1', locationId: 1 },
        { userDescription: 'Gymnasium', locationId: 2 },
        { userDescription: 'VCC Room 2', locationId: 3 },
      ],
    })
    cy.task('stubAppointmentTypes', [
      { code: 'GYM', description: 'Gym' },
      { description: 'Video link booking', code: 'VLB' },
    ])
    cy.task('stubGetStaffDetails', {
      staffId: 'TEST_USER',
      response: { firstName: 'Test', lastName: 'User' },
    })

    cy.task('stubGetAppointment', {
      id: 1,
      appointment: testAppointment,
    })
  })

  it('Should not show delete button', () => {
    cy.visit('/appointment-details/1')
    cy.get('[role="button"]').should('not.exist')
  })
})
