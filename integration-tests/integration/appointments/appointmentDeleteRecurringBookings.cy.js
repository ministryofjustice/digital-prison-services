const DeleteRecurringAppointmentBookingsPage = require('../../pages/appointments/deleteRecurringAppointmentBookingsPage')
const DeletedSingleAppointmentPage = require('../../pages/appointments/deletedSingleAppointmentPage')
const DeletedMultipleAppointmentsPage = require('../../pages/appointments/deletedMultipleAppointmentsPage')

context('Delete recurring appointment page', () => {
  const testAppointment = {
    appointment: {
      offenderNo: 'ABC123',
      id: 1,
      agencyId: 'MDI',
      locationId: 2,
      appointmentTypeCode: 'GYM',
      startTime: '2021-05-20T13:00:00',
    },
    recurring: {
      id: 100,
      repeatPeriod: 'WEEKLY',
      count: 10,
      startTime: '2021-05-20T13:00:00',
    },
    videoLinkBooking: null,
  }

  before(() => {})

  beforeEach(() => {
    cy.session('hmpps-session-dev', () => {
      cy.clearCookies()
      cy.task('resetAndStubTokenVerification')
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'WWI',
        caseloads: [
          {
            caseLoadId: 'WWI',
            description: 'Wandsworth',
            currentlyActive: true,
          },
        ],
      })
      cy.signIn()
    })
    cy.task('stubGetAppointment', {
      id: 1,
      appointment: testAppointment,
    })
  })

  it('Should show the correct information', () => {
    cy.visit('/appointment-details/1/delete-recurring-bookings')

    cy.get('h1').should('contain', 'This appointment had recurring bookings')
    cy.get('[data-qa="recurring-description"]').should(
      'contain',
      'Appointments were also booked weekly until 22 July 2021.'
    )
    cy.get('[data-qa="delete-recurring-question"]').should(
      'contain',
      'Do you want to delete all of these appointments?'
    )
  })

  it('Should show an error if nothing selected', () => {
    cy.visit('/appointment-details/1/delete-recurring-bookings')
    const deleteRecurringAppointmentBookingsPage = DeleteRecurringAppointmentBookingsPage.verifyOnPage()
    const form = deleteRecurringAppointmentBookingsPage.form()
    form.submitButton().click()

    deleteRecurringAppointmentBookingsPage
      .errorSummary()
      .should('contain', 'Select yes if you want to delete all of these appointments')
  })

  context('when single appointment deletion requested', () => {
    it('Should forward to the deleted page when deletion confirmed and succeeds', () => {
      cy.task('stubDeleteAppointment', {
        id: 1,
      })

      cy.visit('/appointment-details/1/delete-recurring-bookings')
      const deleteRecurringAppointmentBookingsPage = DeleteRecurringAppointmentBookingsPage.verifyOnPage()
      const form = deleteRecurringAppointmentBookingsPage.form()
      form.confirmNo().click()
      form.submitButton().click()

      DeletedSingleAppointmentPage.verifyOnPage()
    })

    it('Should go to the error page if deletion confirmed then fails', () => {
      cy.task('stubDeleteAppointment', {
        id: 1,
        status: 500,
      })

      cy.visit('/appointment-details/1/delete-recurring-bookings')
      const deleteRecurringAppointmentBookingsPage = DeleteRecurringAppointmentBookingsPage.verifyOnPage()
      const form = deleteRecurringAppointmentBookingsPage.form()
      form.confirmNo().click()
      form.submitButton().click()

      cy.get('h1').should('have.text', 'Sorry, there is a problem with the service')
    })
  })

  context('when deletion of recurring appointment sequence requested', () => {
    it('Should forward to the deleted page when deletion confirmed and succeeds', () => {
      cy.task('stubDeleteRecurringAppointmentSequence', {
        id: 100,
      })

      cy.visit('/appointment-details/1/delete-recurring-bookings')
      const deleteRecurringAppointmentBookingsPage = DeleteRecurringAppointmentBookingsPage.verifyOnPage()
      const form = deleteRecurringAppointmentBookingsPage.form()
      form.confirmYes().click()
      form.submitButton().click()

      DeletedMultipleAppointmentsPage.verifyOnPage()
    })

    it('Should go to the error page if deletion confirmed then fails', () => {
      cy.task('stubDeleteRecurringAppointmentSequence', {
        id: 100,
        status: 500,
      })

      cy.visit('/appointment-details/1/delete-recurring-bookings')
      const deleteRecurringAppointmentBookingsPage = DeleteRecurringAppointmentBookingsPage.verifyOnPage()
      const form = deleteRecurringAppointmentBookingsPage.form()
      form.confirmYes().click()
      form.submitButton().click()

      cy.get('h1').should('have.text', 'Sorry, there is a problem with the service')
    })
  })
})
