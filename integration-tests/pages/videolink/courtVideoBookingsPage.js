const page = require('../page')

const courtVideoBookingsPage = () =>
  page('Video link bookings for', {
    searchResultsTableRows: () => cy.get("[data-qa='court-bookings-table'] tr"),
    noResultsMessage: () => cy.get("[data-qa='no-results-message']"),
    courtOption: () => cy.get('#courtOption'),
    submitButton: () => cy.get('button[type="submit"]'),
  })

export default {
  verifyOnPage: courtVideoBookingsPage,
  goTo: () => {
    cy.visit('/videolink/bookings')
    return courtVideoBookingsPage()
  },
}
