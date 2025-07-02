const ConfirmDeleteAppointmentPage = require('../../pages/appointments/confirmDeleteAppointmentPage')
const DeletedSingleAppointmentPage = require('../../pages/appointments/deletedSingleAppointmentPage')

context('Confirm appointment deletion page', () => {
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

  beforeEach(() => {
    cy.task('resetAndStubTokenVerification')
    cy.session('hmpps-session-dev', () => {
      cy.clearCookies()
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
    })

    cy.task('stubNomisLocationMapping', { nomisLocationId: 1, dpsLocationId: 'dps-1' })
    cy.task('stubNomisLocationMapping', { nomisLocationId: 2, dpsLocationId: 'dps-2' })
    cy.task('stubNomisLocationMapping', { nomisLocationId: 3, dpsLocationId: 'dps-3' })
    cy.task('stubGetLocationsByNonResidentialUsageType', {
      agency: 'MDI',
      locations: [
        { localName: 'VCC Room 1', id: 'dps-1' },
        { localName: 'Gymnasium', id: 'dps-2' },
        { localName: 'VCC Room 2', id: 'dps-3' },
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
    cy.visit('/appointment-details/1/confirm-deletion')

    cy.get('h1').should('contain', 'Are you sure you want to delete this appointment?')
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
      cy.visit('/appointment-details/1/confirm-deletion')

      cy.get('h1').should('contain', 'Are you sure you want to delete this appointment?')
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
          },
        },
      })
      cy.task('stubGetLocationById', { id: 'dps-1', response: { key: 'location-key' } })
      cy.task('stubGetLocationByKey', { key: 'location-key', response: { id: 'dps-1' } })
      cy.task('matchAppointmentToVideoLinkBooking', {
        videoLinkBookingId: 1,
        bookingType: 'COURT',
        prisonAppointments: [
          { appointmentType: 'VLB_COURT_PRE', prisonLocKey: 'location-key', startTime: '12:45', endTime: '13:00' },
          { appointmentType: 'VLB_COURT_MAIN', prisonLocKey: 'location-key', startTime: '13:00', endTime: '14:00' },
          { appointmentType: 'VLB_COURT_POST', prisonLocKey: 'location-key', startTime: '14:00', endTime: '14:15' },
        ],
        courtDescription: 'Nottingham Justice Centre',
        courtHearingTypeDescription: 'Appeal',
      })
    })

    it('Should show the correct information information', () => {
      cy.visit('/appointment-details/1/confirm-deletion')

      cy.get('h1').should('contain', 'Are you sure you want to delete this appointment?')
      cy.get('.qa-type-value').should('contain', 'Video link booking')
      cy.get('.qa-location-value').should('contain', 'VCC Room 1')
      cy.get('.qa-date-value').should('contain', '20 May 2021')
      cy.get('.qa-startTime-value').should('contain', '13:00')
      cy.get('.qa-endTime-value').should('contain', '14:00')
      cy.get('.qa-preCourtHearingBriefing-value').should('contain', 'VCC Room 1 - 12:45 to 13:00')
      cy.get('.qa-postCourtHearingBriefing-value').should('contain', 'VCC Room 1 - 14:00 to 14:15')
      cy.get('.qa-courtLocation-value').should('contain', 'Nottingham Justice Centre')
      cy.get('.qa-hearingType-value').should('contain', 'Appeal')
      cy.get('.qa-courtHearingLink-value').should('contain', 'None entered')
      cy.get('.qa-recurring-value').should('not.exist')
      cy.get('.qa-repeats-value').should('not.exist')
      cy.get('.qa-lastAppointment-value').should('not.exist')
      cy.get('.qa-notesForPrisonStaff-value').should('contain', 'None entered')
      cy.get('.qa-notesForPrisoner-value').should('contain', 'None entered')
    })
  })

  context('when it is a single appointment and selection submitted', () => {
    it('Should forward to the deleted page when deletion confirmed and succeeds', () => {
      cy.task('stubDeleteAppointment', {
        id: 1,
      })

      cy.visit('/appointment-details/1/confirm-deletion')
      const confirmDeleteAppointmentPage = ConfirmDeleteAppointmentPage.verifyOnPage()
      const form = confirmDeleteAppointmentPage.form()
      form.confirmYes().click()
      form.submitButton().click()

      DeletedSingleAppointmentPage.verifyOnPage()
    })

    it('Should go to the error page if deletion confirmed then fails', () => {
      cy.task('stubDeleteAppointment', {
        id: 1,
        status: 500,
      })

      cy.visit('/appointment-details/1/confirm-deletion')
      const confirmDeleteAppointmentPage = ConfirmDeleteAppointmentPage.verifyOnPage()
      const form = confirmDeleteAppointmentPage.form()
      form.confirmYes().click()
      form.submitButton().click()

      cy.get('h1').should('have.text', 'Sorry, there is a problem with the service')
    })

    it('Should return to the appointment details page when deletion rejected', () => {
      cy.visit('/appointment-details/1/confirm-deletion')
      const confirmDeleteAppointmentPage = ConfirmDeleteAppointmentPage.verifyOnPage()
      const form = confirmDeleteAppointmentPage.form()
      form.confirmNo().click()
      form.submitButton().click()

      cy.url().should('include', '/appointment-details/1')
    })

    it('Should show an error if nothing selected', () => {
      cy.visit('/appointment-details/1/confirm-deletion')
      const confirmDeleteAppointmentPage = ConfirmDeleteAppointmentPage.verifyOnPage()
      const form = confirmDeleteAppointmentPage.form()
      form.submitButton().click()

      confirmDeleteAppointmentPage.errorSummary().should('contain', 'Select yes if you want to delete this appointment')
    })
  })

  context('when it is a recurring appointment and selection submitted', () => {
    it('Should forward to the recurring page when deletion confirmed', () => {
      cy.visit('/appointment-details/1/confirm-deletion')
      const confirmDeleteAppointmentPage = ConfirmDeleteAppointmentPage.verifyOnPage()
      const form = confirmDeleteAppointmentPage.form()
      form.confirmYes().click()
      form.submitButton().click()

      cy.url().should('include', 'deleted?multipleDeleted=false')
    })

    it('Should return to the appointment details page when deletion rejected', () => {
      cy.visit('/appointment-details/1/confirm-deletion')
      const confirmDeleteAppointmentPage = ConfirmDeleteAppointmentPage.verifyOnPage()
      const form = confirmDeleteAppointmentPage.form()
      form.confirmNo().click()
      form.submitButton().click()

      cy.url().should('include', '/appointment-details/1')
    })

    it('Should show an error if nothing selected', () => {
      cy.visit('/appointment-details/1/confirm-deletion')
      const confirmDeleteAppointmentPage = ConfirmDeleteAppointmentPage.verifyOnPage()
      const form = confirmDeleteAppointmentPage.form()
      form.submitButton().click()

      confirmDeleteAppointmentPage.errorSummary().should('contain', 'Select yes if you want to delete this appointment')
    })
  })
})
