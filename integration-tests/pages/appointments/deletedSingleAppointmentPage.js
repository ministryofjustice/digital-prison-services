const page = require('../page')

const deletedSingleAppointmentPage = () =>
  page('The appointment has been deleted', {
    finishLink: () => cy.get('[data-test="appointments-home"]'),
  })

export default {
  verifyOnPage: deletedSingleAppointmentPage,
  goTo: () => {
    cy.visit('/appointment-details/deleted')
    return deletedSingleAppointmentPage()
  },
}
