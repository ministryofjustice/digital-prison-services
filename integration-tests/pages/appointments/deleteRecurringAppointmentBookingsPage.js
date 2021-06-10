const page = require('../page')

const deleteRecurringAppointmentBookingsPage = () =>
  page('This appointment had recurring bookings', {
    form: () => ({
      confirmYes: () => cy.get('#deleteRecurringSequence'),
      confirmNo: () => cy.get('#deleteRecurringSequence-2'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    errorSummary: () => cy.get('.govuk-error-summary'),
  })

export default {
  verifyOnPage: deleteRecurringAppointmentBookingsPage,
  goTo: appointmentId => {
    cy.visit(`/appointment-details/${appointmentId}/delete-recurring-bookings`)
    return deleteRecurringAppointmentBookingsPage()
  },
}
