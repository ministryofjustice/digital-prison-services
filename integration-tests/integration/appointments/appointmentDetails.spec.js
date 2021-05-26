const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

context('Appointment details page', () => {
  const testAppointment = {
    appointment: {
      offenderNo: 'ABC123',
      id: 1,
      agencyId: 'MDI',
      locationId: 2,
      appointmentTypeCode: 'GYM',
      startTime: '2021-05-20T13:00:00',
    },
    recurring: null,
    videoLinkBooking: null,
  }

  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
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
  })

  it('Should show the correct information', () => {
    cy.visit('/appointment-details/1')

    cy.get('h1').should('contain', 'John Smith’s appointment details')
    cy.get('[data-test="prisoner-number"]').should('contain', 'ABC123')
    cy.get('.qa-type-value').should('contain', 'Gym')
    cy.get('.qa-location-value').should('contain', 'Gymnasium')
    cy.get('.qa-date-value').should('contain', 'Thursday 20 May 2021')
    cy.get('.qa-startTime-value').should('contain', '13:00')
    cy.get('.qa-endTime-value').should('contain', 'Not entered')
    cy.get('.qa-preCourtHearingBriefing-value').should('not.exist')
    cy.get('.qa-postCourtHearingBriefing-value').should('not.exist')
    cy.get('.qa-courtLocation-value').should('not.exist')
    cy.get('.qa-recurring-value').should('contain', 'No')
    cy.get('.qa-repeats-value').should('not.exist')
    cy.get('.qa-lastAppointment-value').should('not.exist')
    cy.get('.qa-comments-value').should('contain', 'Not entered')
    cy.get('[data-test="return-link"]')
      .should('have.attr', 'href')
      .should('include', '/view-all-appointments')
  })

  context('when it is a recurring appointment', () => {
    beforeEach(() => {
      cy.task('stubGetAppointment', {
        id: 1,
        appointment: {
          ...testAppointment,
          recurring: {
            repeatPeriod: 'WEEKLY',
            count: 10,
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
      cy.get('.qa-date-value').should('contain', 'Thursday 20 May 2021')
      cy.get('.qa-startTime-value').should('contain', '13:00')
      cy.get('.qa-endTime-value').should('contain', 'Not entered')
      cy.get('.qa-preCourtHearingBriefing-value').should('not.exist')
      cy.get('.qa-postCourtHearingBriefing-value').should('not.exist')
      cy.get('.qa-courtLocation-value').should('not.exist')
      cy.get('.qa-recurring-value').should('contain', 'Yes')
      cy.get('.qa-repeats-value').should('contain', 'Weekly')
      cy.get('.qa-lastAppointment-value').should('contain', 'Thursday 22 July 2021')
      cy.get('.qa-comments-value').should('contain', 'Not entered')
      cy.get('[data-test="return-link"]')
        .should('have.attr', 'href')
        .should('include', '/view-all-appointments')
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
          },
          videoLinkBooking: {
            pre: {
              court: 'Nottingham Justice Centre',
              hearingType: 'PRE',
              locationId: 3,
              startTime: '2021-05-20T12:45:00',
              endTime: '2021-05-20T13:00:00',
            },
            main: {
              court: 'Nottingham Justice Centre',
              hearingType: 'MAIN',
              locationId: 1,
              startTime: '2021-05-20T13:00:00',
              endTime: '2021-05-20T14:00:00',
            },
            post: {
              court: 'Nottingham Justice Centre',
              hearingType: 'POST',
              locationId: 3,
              startTime: '2021-05-20T14:00:00',
              endTime: '2021-05-20T14:15:00',
            },
          },
        },
      })
    })

    it('Should show the correct information information', () => {
      cy.visit('/appointment-details/1')

      cy.get('h1').should('contain', 'John Smith’s appointment details')
      cy.get('[data-test="prisoner-number"]').should('contain', 'ABC123')
      cy.get('.qa-type-value').should('contain', 'Video link booking')
      cy.get('.qa-location-value').should('contain', 'VCC Room 1')
      cy.get('.qa-date-value').should('contain', 'Thursday 20 May 2021')
      cy.get('.qa-startTime-value').should('contain', '13:00')
      cy.get('.qa-endTime-value').should('contain', '14:00')
      cy.get('.qa-preCourtHearingBriefing-value').should('contain', 'VCC Room 2 - 12:45 to 13:00')
      cy.get('.qa-postCourtHearingBriefing-value').should('contain', 'VCC Room 2 - 14:00 to 14:15')
      cy.get('.qa-courtLocation-value').should('contain', 'Nottingham Justice Centre')
      cy.get('.qa-recurring-value').should('not.exist')
      cy.get('.qa-repeats-value').should('not.exist')
      cy.get('.qa-lastAppointment-value').should('not.exist')
      cy.get('.qa-comments-value').should('contain', 'Test appointment comments')
      cy.get('[data-test="return-link"]')
        .should('have.attr', 'href')
        .should('include', '/view-all-appointments')
    })
  })
})
