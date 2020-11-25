const page = require('../page')

const confirmCellMovePage = (name, cell) =>
  page(`You are moving ${name} to cell ${cell}`, {
    backToSelectCellLink: () => cy.get('[data-qa="back-to-select-cell"]'),
    warning: () => cy.get('.govuk-inset-text'),
    form: () => ({
      submitButton: () => cy.get('button[type="submit"]'),
    }),
  })

export default {
  verifyOnPage: (name, cell) => confirmCellMovePage(name, cell),
  goTo: (offenderNo, cellId, name, cell) => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/confirm-cell-move?cellId=${cellId}`)
    return confirmCellMovePage(name, cell)
  },
}
