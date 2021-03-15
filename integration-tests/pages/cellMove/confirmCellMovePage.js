const page = require('../page')

const confirmCellMovePage = (name, cell) =>
  page(`You are moving ${name} ${cell === 'swap' ? 'out of their current location' : `to cell ${cell}`}`, {
    backLink: () => cy.get('[data-test="back-link"]'),
    warning: () => cy.get('.govuk-inset-text'),
    form: () => ({
      submitButton: () => cy.get('button[type="submit"]'),
      reason: () => cy.get('#reason'),
      comment: () => cy.get('#comment'),
    }),
  })

export default {
  verifyOnPage: (name, cell) => confirmCellMovePage(name, cell),
  goTo: (offenderNo, cellId, name, cell) => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/confirm-cell-move?cellId=${cellId}`)
    return confirmCellMovePage(name, cell)
  },
}
