const page = require('../page')

const prisonerLocationHistory = () =>
  page('history in location', {
    title: () => cy.get("[data-test='title']"),
    establishment: () => cy.get("[data-test='establishment']"),
    movedIn: () => cy.get("[data-test='moved-in']"),
    movedOut: () => cy.get("[data-test='moved-out']"),
    type: () => cy.get("[data-test='cell-type']"),
    results: () => cy.get('[data-test="prisoner-location-history"]'),
    noHistoryMessage: () => cy.get('[data-test="no-history-message"]'),
  })

export default {
  verifyOnPage: prisonerLocationHistory,
}
