const page = require('../page')

const confirmDeleteAppointmentPage = () =>
  page('Are you sure you want to delete this appointment?', {
    form: () => ({
      confirmYes: () => cy.get('#confirmation'),
      confirmNo: () => cy.get('#confirmation-2'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    errorSummary: () => cy.get('.govuk-error-summary'),
  })

export default {
  verifyOnPage: confirmDeleteAppointmentPage,
  goTo: appointmentId => {
    cy.visit(`/appointment-details/${appointmentId}/confirm-deletion`)
    return confirmDeleteAppointmentPage()
  },
}
