const page = require('../page')

const col = (i, j) =>
  cy
    .get(`[data-qa=reverse-cohorting-table] tbody tr`)
    .eq(i)
    .find('td')
    .eq(j)

const reverseCohortingUnitPage = () =>
  page('Prisoners in the Reverse Cohorting Unit', {
    prisonerCount: () => cy.get('[data-qa="prisonerCount"]'),
    nameSort: () => cy.get('[data-qa="sort-name"]').find('button'),
    getRow: i => ({
      prisoner: () => col(i, 0).find('a'),
      prisonNumber: () => col(i, 1),
      location: () => col(i, 2),
      dateAdded: () => col(i, 3),
      dateOverdue: () => col(i, 4),
      changeAlertLink: () => col(i, 5),
      overdue: () => col(i, 6).find('[data-qa=overdue]'),
    }),

    notInUnit: () => cy.get('[data-qa="notInUnit"]'),
    notInUnitLink: () => cy.get('[data-qa="notInUnit-link"]'),
  })

export default {
  verifyOnPage: reverseCohortingUnitPage,
  goTo: () => {
    cy.visit('/current-covid-units/reverse-cohorting-unit')
    return reverseCohortingUnitPage()
  },
}
