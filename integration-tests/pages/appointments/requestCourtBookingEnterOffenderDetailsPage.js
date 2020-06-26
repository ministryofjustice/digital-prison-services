const page = require('../page')

const requestCourtBookingEnterOffenderDetailsPage = () =>
  page('Who is the video link for?', {
    form: () => ({
      firstName: () => cy.get('#first-name'),
      lastName: () => cy.get('#last-name'),
      dobDay: () => cy.get('#dobDay'),
      dobMonth: () => cy.get('#dobMonth'),
      dobYear: () => cy.get('#dobYear'),
      comments: () => cy.get('#comments'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
  })

export default {
  verifyOnPage: requestCourtBookingEnterOffenderDetailsPage,
  goTo: () => {
    cy.visit('/request-booking/enter-offender-details')
    return requestCourtBookingEnterOffenderDetailsPage()
  },
}
