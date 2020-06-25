const page = require('../page')

const bulkAppointmentsNotAddedPage = () =>
  page('No appointments have been added', {
    notAddedMessage: () => cy.get("[data-qa='appointments-not-added-message']"),
    uploadAnotherFileCTA: () =>
      cy.get("[data-qa='upload-another-file']").find('[href="/bulk-appointments/upload-file"]'),
    exitBulkAppointmentsCTA: () =>
      cy.get("[data-qa='exit-bulk-appointments']").find('[href="http://localhost:20200/"]'),
  })

export default {
  verifyOnPage: bulkAppointmentsNotAddedPage,
  goTo: () => {
    cy.visit('/bulk-appointments/no-appointments-added')
    return bulkAppointmentsNotAddedPage()
  },
}
