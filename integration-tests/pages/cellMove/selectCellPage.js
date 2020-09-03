const page = require('../page')

const selectCellPage = () =>
  page('Select an available cell', {
    message: () => cy.get("[data-test='message']"),
    backLink: () => cy.get('a.govuk-link'),
  })

export default {
  verifyOnPage: selectCellPage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/select-cell`)
    return selectCellPage()
  },
}
