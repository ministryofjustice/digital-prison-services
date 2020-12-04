const page = require('../page')

const searchForCellPage = () =>
  page('Search for a cell', {
    form: () => ({
      location: () => cy.get('#location'),
      attribute: () => cy.get('#attribute'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    name: () => cy.get("[data-test='name']"),
    detailsLink: () => cy.get("[data-test='name-link']"),
    livingUnit: () => cy.get("[data-test='living-unit']"),
    csra: () => cy.get("[data-test='csra']"),
    csraLink: () => cy.get("[data-test='csra-link']"),
    alerts: () => cy.get("[data-test='alerts']"),
    numberOfNonAssociations: () => cy.get("[data-test='number-of-non-associations']"),
    nonAssociationsLink: () => cy.get("[data-test='non-associations-link']"),
    nonAssociationsMessage: () => cy.get("[data-test='non-associations-message']"),
    selectCswapText: () => cy.get('[data-test="select-cswap-text"]'),
    selectCswapLink: () => cy.get('[data-test="select-cswap-link"]'),
  })

export default {
  verifyOnPage: searchForCellPage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/search-for-cell`)
    return searchForCellPage()
  },
}
