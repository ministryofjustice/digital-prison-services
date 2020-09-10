const page = require('../page')

const selectCellPage = () =>
  page('Select an available cell', {
    message: () => cy.get("[data-test='message']"),
    backLink: () => cy.get('a.govuk-link'),
    cellResults: () => cy.get('[data-test="cell-results-table"]'),
    locationTableHeader: () => cy.get('[data-test="location-table-header"]').find('button'),
    nonAssociationWarning: () => cy.get('#non-association-warning'),
  })

export default {
  verifyOnPage: selectCellPage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/select-cell`)
    return selectCellPage()
  },
}
