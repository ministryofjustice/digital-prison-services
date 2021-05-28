const page = require('../page')

const deletedMultipleAppointmentsPage = () =>
  page('The appointments have been deleted', {
    finishLink: () => cy.get('[data-test="appointments-home"]'),
  })

export default {
  verifyOnPage: deletedMultipleAppointmentsPage,
  goTo: () => {
    cy.visit('/appointment-details/deleted?multipleDeleted=true')
    return deletedMultipleAppointmentsPage()
  },
}
