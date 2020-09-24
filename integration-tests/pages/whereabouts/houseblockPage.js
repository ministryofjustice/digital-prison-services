const page = require('../page')

const houseblockPage = title =>
  page(title, {
    location: () => cy.get('#housing-location-select'),
    period: () => cy.get('#period-select'),
    searchDate: () => cy.get('#search-date'),
    printButton: () => cy.get('#printButton'),
    tableRows: () => cy.get('table.row-gutters tr'),
    nameOrderLink: () => cy.get('th #Name-sortable-column'),
    locationOrderLink: () => cy.get('th #Location-sortable-column'),
    absentReasonForm: () => cy.get('.ReactModalPortal form'),
    incentiveLevelCreated: () => cy.get('[data-qa="iep-created"]'),
  })

export default {
  verifyOnPage: houseblockPage,
}
