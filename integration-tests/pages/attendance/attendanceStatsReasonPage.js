const page = require('../page')

const attendanceStatsReasonPage = (title) =>
  page(title, {
    reasonOccurrences: () => cy.get('[id="offenderListTable"]'),

    timespan: () => cy.get('[data-qa="timespan"]'),

    sortSelect: () => cy.get('#sortingOptions'),
  })

export default {
  verifyOnPage: attendanceStatsReasonPage,
}
