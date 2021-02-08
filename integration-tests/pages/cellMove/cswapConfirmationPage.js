const page = require('../page')

const cswapMoveConfirmationPage = (name, cellDescription) =>
  page(`${name} has been moved to ${cellDescription}`, {
    backToSearchLink: () => cy.get("[data-test='back-to-search']"),
  })

export default {
  goTo: ({ offenderNo, name, cellDescription }) => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/space-created`)
    return cswapMoveConfirmationPage(name, cellDescription)
  },
}
