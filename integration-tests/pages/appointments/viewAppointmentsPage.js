const page = require('../page')

const viewAppointmentsPage = () =>
  page('Appointments for', {
    form: () => ({
      appointmentType: () => cy.get('#type'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    noResultsMessage: () => cy.get('[data-qa="no-results-message"]'),
    results: () => cy.get('[data-qa="appointments-table"] tr'),
  })

export default {
  verifyOnPage: viewAppointmentsPage,
  goTo: () => {
    cy.visit('/appointments')
    return viewAppointmentsPage()
  },
}
