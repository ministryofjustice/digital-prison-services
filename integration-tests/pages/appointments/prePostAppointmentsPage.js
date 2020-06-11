const page = require('../page')

const prePostAppointmentsPage = () =>
  page('Video link booking details', {
    form: () => ({
      preAppointmentYes: () => cy.get('#preAppointment'),
      preAppointmentLocation: () => cy.get('#preAppointmentLocation'),
      preAppointmentDuration: () => cy.get('#preAppointmentDuration'),
      preAppointmentNo: () => cy.get('#preAppointment-2'),
      postAppointmentYes: () => cy.get('#postAppointment'),
      postAppointmentLocation: () => cy.get('#postAppointmentLocation'),
      postAppointmentDuration: () => cy.get('#postAppointmentDuration'),
      postAppointmentNo: () => cy.get('#postAppointment-2'),
      court: () => cy.get('#court'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    errorSummary: () => cy.get('.govuk-error-summary'),
  })

export default {
  verifyOnPage: prePostAppointmentsPage,
  goTo: offenderNo => {
    cy.visit(`/offenders/${offenderNo}/prepost-appointments`)
    return prePostAppointmentsPage()
  },
}
