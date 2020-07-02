const page = require('../page')

const bulkAppointmentsClashesPage = () =>
  page('Appointment clashes', {
    form: offenderNo => ({
      submitButton: () => cy.get('button[type="submit"]'),
      offenderNo: () => cy.get(`#${offenderNo}`),
    }),
    prisonersWithClashes: () => cy.get('[data-qa="prisoners-with-clashes"]'),
  })

export default {
  verifyOnPage: bulkAppointmentsClashesPage,
  goTo: () => {
    cy.visit('/bulk-appointments/appointment-clashes')
    return bulkAppointmentsClashesPage()
  },
}
