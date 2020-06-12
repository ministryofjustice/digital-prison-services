const page = require('../page')

const col = (i, j) =>
  cy
    .get(`[data-qa=protective-isolation-table] tbody tr`)
    .eq(i)
    .find('td')
    .eq(j)

const viewProtectiveIsolationUnitPage = () =>
  page('Prisoners in the Protective Isolation Unit', {
    prisonerCount: () => cy.get('[data-qa="prisonerCount"]'),
    getRow: i => ({
      prisoner: () => col(i, 0).find('a'),
      prisonNumber: () => col(i, 1),
      location: () => col(i, 2),
      dateAdded: () => col(i, 3),
      daysInUnit: () => col(i, 4),
      changeAlertLink: () => col(i, 5),
    }),
  })

export default {
  verifyOnPage: viewProtectiveIsolationUnitPage,
  goTo: () => {
    cy.visit('/protective-isolation-unit')
    return viewProtectiveIsolationUnitPage()
  },
}
