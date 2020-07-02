const page = require('../page')

const bulkAppointmentsAddedPage = () =>
  page('The appointments have been added', {
    printMovementsCTA: () =>
      cy.get("[data-qa='print-movement-slips']").find('[href="/bulk-appointments/appointments-movement-slips"]'),
    addMoreAppointmentsCTA: () =>
      cy.get("[data-qa='add-more-appointments']").find('[href="/bulk-appointments/add-appointment-details"]'),
    exitBulkAppointmentsCTA: () =>
      cy.get("[data-qa='exit-bulk-appointments']").find('[href="http://localhost:20200/"]'),
  })

export default {
  verifyOnPage: bulkAppointmentsAddedPage,
  goTo: () => {
    cy.visit('/bulk-appointments/appointments-added')
    return bulkAppointmentsAddedPage()
  },
}
