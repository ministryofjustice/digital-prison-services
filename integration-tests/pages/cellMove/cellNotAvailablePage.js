const page = require('../page')

const cellNotAvailablePage = cellDescription =>
  page(`Cell ${cellDescription} is no longer available`, {
    body: () => cy.get('.govuk-body'),
    selectAnotherCellLink: () => cy.get("[data-test='select-another-cell-link']"),
    breadcrumbNodes: () => cy.get('.govuk-breadcrumbs__list'),
  })

export default {
  goTo: ({ offenderNo, cellDescription }) => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/cell-not-available?cellDescription=${cellDescription}`)
    return cellNotAvailablePage(cellDescription)
  },
}
