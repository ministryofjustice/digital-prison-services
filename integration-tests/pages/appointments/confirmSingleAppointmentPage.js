const page = require('../page')

const confirmSingleAppointmentPage = () => page('Appointment booked', {})

export default {
  verifyOnPage: confirmSingleAppointmentPage,
  goTo: offenderNo => {
    cy.visit(`/offenders/${offenderNo}/confirm-appointment`)
    return confirmSingleAppointmentPage()
  },
}
