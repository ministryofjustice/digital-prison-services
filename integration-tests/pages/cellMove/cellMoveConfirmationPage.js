const page = require('../page')

const cellMoveConfirmationPage = (name, cellDescription) =>
  page(`${name} has been moved to cell ${cellDescription}`, {
    backToStart: () => cy.get("[data-test='back-to-start']"),
  })

export default {
  goTo: ({ offenderNo, name, cellDescription, cellId }) => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/confirmation?cellId=${cellId}`)
    return cellMoveConfirmationPage(name, cellDescription)
  },
}
