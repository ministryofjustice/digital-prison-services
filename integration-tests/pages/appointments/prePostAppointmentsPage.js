const page = require('../page')

const prePostAppointmentsPage = () =>
  page('Video link booking details', {
    form: () => cy.get('form'),
    submitButton: () => cy.get('button[type="submit"]'),
    errorSummary: () => cy.get('.govuk-error-summary'),
  })

export default {
  verifyOnPage: prePostAppointmentsPage,
  goTo: offenderNo => {
    cy.visit(`/offenders/${offenderNo}/prepost-appointments`)
    return prePostAppointmentsPage()
  },
}
