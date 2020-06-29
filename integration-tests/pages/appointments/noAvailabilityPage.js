const page = require('../page')

const noAvailabilityPage = () =>
  page('There are no video link bookings available', {
    info: () => cy.get('.govuk-body p').first(),
  })

export default {
  verifyOnPage: noAvailabilityPage,
}
