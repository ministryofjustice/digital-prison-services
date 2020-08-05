const page = require('../page')

const selectLocationPage = () =>
  page('Select a location', {
    name: () => cy.get("[data-test='name']"),
    detailsLink: () => cy.get("[data-test='name-link']"),
    livingUnit: () => cy.get("[data-test='living-unit']"),
    csra: () => cy.get("[data-test='csra']"),
    csraLink: () => cy.get("[data-test='csra-link']"),
    alerts: () => cy.get("[data-test='alerts']"),
    nonAssociationsLink: () => cy.get("[data-test='non-associations-link']"),
    nonAssociationsMessage: () => cy.get("[data-test='non-associations-message']"),
  })

export default {
  verifyOnPage: selectLocationPage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/select-location`)
    return selectLocationPage()
  },
}
