const page = require('../page')

const confirmRecurringAppointmentPage = () => page('Appointments booked', {})

export default {
  verifyOnPage: confirmRecurringAppointmentPage,
  goTo: offenderNo => {
    cy.visit(`/offenders/${offenderNo}/confirm-appointment`)
    return confirmRecurringAppointmentPage()
  },
}
