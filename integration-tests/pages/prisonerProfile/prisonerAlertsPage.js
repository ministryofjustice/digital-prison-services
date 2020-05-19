const page = require('../page')

const activeRow = i => cy.get('[data-qa="active-alerts-table"] tbody tr').eq(i)
const activeCol = (i, j) =>
  activeRow(i)
    .find('td')
    .eq(j)

const inactiveRow = i => cy.get('[data-qa="inactive-alerts-table"] tbody tr').eq(i)
const inactiveCol = (i, j) =>
  inactiveRow(i)
    .find('td')
    .eq(j)

const prisonerAlertsPage = offenderName =>
  page(offenderName, {
    getFilterForm: () => ({
      getTitle: () => cy.get('h2').first(),
      activeFilter: () => cy.get('[data-qa="actve-filter"]'),
      typeFilter: () => cy.get('[data-qa="type-filter"]'),
      fromFilter: () => cy.get('[data-qa="from-filter"]'),
      toFilter: () => cy.get('[data-qa="to-filter"]'),
      clearLink: () => cy.get('[data-qa="clear-link"]'),
      applyButton: () => cy.get('button'),
    }),
    createAlertButton: () => cy.get('[data-qa="create-alert"]'),
    tableTitle: () => cy.get('[data-qa="alerts-table-title"]'),
    getActiveAlertsRows: i => ({
      typeOfAlert: () => activeCol(i, 0),
      alert: () => activeCol(i, 1),
      comments: () => activeCol(i, 2),
      dateFrom: () => activeCol(i, 3),
      createdBy: () => activeCol(i, 4),
      editCreateButton: () => activeCol(i, 5),
    }),
    getInactiveAlertsRows: i => ({
      typeOfAlert: () => inactiveCol(i, 0),
      details: () => inactiveCol(i, 1),
      comments: () => inactiveCol(i, 2),
      dateFromDateClosed: () => inactiveCol(i, 3),
      createdByClosedBy: () => inactiveCol(i, 4),
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
