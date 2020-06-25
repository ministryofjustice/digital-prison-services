const page = require('../page')

const bulkAppointmentsInvalidNumbersPage = () =>
  page('Some appointments cannot be added', {
    continueCTA: () => cy.get("[data-qa='continue-with-invalid']"),
    cancelCTA: () => cy.get("[data-qa='upload-another-file']"),
    prisonersNotFound: () => cy.get("[data-qa='invalid-numbers-not-found']"),
    prisonersDuplicated: () => cy.get("[data-qa='invalid-numbers-duplicated']"),
  })

export default {
  verifyOnPage: bulkAppointmentsInvalidNumbersPage,
  goTo: () => {
    cy.visit('/bulk-appointments/invalid-numbers')
    return bulkAppointmentsInvalidNumbersPage()
  },
}
