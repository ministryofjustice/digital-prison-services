const page = require('../page')

const confirmSingleAppointmentPage = name => page(`${name} appointment has been added`, {})

export default {
  verifyOnPage: name => confirmSingleAppointmentPage(name),
  goTo: (offenderNo, name) => {
    cy.visit(`/offenders/${offenderNo}/confirm-appointment`)
    return confirmSingleAppointmentPage(name)
  },
}
