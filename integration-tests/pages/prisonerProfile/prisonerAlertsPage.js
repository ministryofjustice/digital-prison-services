const page = require('../page')

const tableRow = i => cy.get('tbody tr').eq(i)
const tableCol = (i, j) =>
  tableRow(i)
    .find('td')
    .eq(j)

const prisonerAlertsPage = offenderName =>
  page(offenderName, {
    getFilterForm: () => ({
      getTitle: () => cy.get('h2').first(),
      activeFilter: () => cy.get('[data-qa="active-filter"]'),
      typeFilter: () => cy.get('[data-qa="type-filter"]'),
      fromFilter: () => cy.get('[data-qa="from-filter"]'),
      toFilter: () => cy.get('[data-qa="to-filter"]'),
      clearLink: () => cy.get('[data-qa="clear-link"]'),
      applyButton: () => cy.get('button'),
    }),
    createAlertButton: () => cy.get('[data-qa="create-alert"]'),
    tableTitle: () => cy.get('[data-qa="alerts-table-title"]'),
    getActiveAlertsRows: i => ({
      typeOfAlert: () => tableCol(i, 0),
      alert: () => tableCol(i, 1),
      comments: () => tableCol(i, 2),
      dateFrom: () => tableCol(i, 3),
      createdBy: () => tableCol(i, 4),
      editCreateButton: () => tableCol(i, 5),
    }),
    getInactiveAlertsRows: i => ({
      typeOfAlert: () => tableCol(i, 0),
      details: () => tableCol(i, 1),
      comments: () => tableCol(i, 2),
      dateFromDateClosed: () => tableCol(i, 3),
      createdByClosedBy: () => tableCol(i, 4),
    }),
    getPagination: () => ({
      getPaginationList: () => cy.get('.moj-pagination__list'),
      getPaginationResults: () => cy.get('.moj-pagination__results'),
    }),
  })

export default {
  verifyOnPage: prisonerAlertsPage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/alerts`)
    return prisonerAlertsPage()
  },
}
