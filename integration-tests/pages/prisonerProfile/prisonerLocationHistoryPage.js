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
    movedBy: () => cy.get('[data-test="moved-by"]'),
    reasonForMove: () => cy.get('[data-test="reason-for-move"]'),
    whatHappened: () => cy.get('[data-test="what-happened"]'),
  })

export default {
  verifyOnPage: prisonerLocationHistory,
}
