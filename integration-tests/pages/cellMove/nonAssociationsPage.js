const page = require('../page')

const nonAssociationsPage = () =>
  page('Active non-association details for', {
    message: () => cy.get("[data-test='message']"),
    backLink: () => cy.get('a.govuk-link'),
  })

export default {
  verifyOnPage: nonAssociationsPage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/non-associations`)
    return nonAssociationsPage()
  },
}
