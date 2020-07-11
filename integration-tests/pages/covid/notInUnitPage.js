const page = require('../page')

const col = (i, j) =>
  cy
    .get(`[data-qa=not-in-unit-table] tbody tr`)
    .eq(i)
    .find('td')
    .eq(j)

const notInUnitPage = () =>
  page('Newly arrived prisoners not in Reverse Cohorting Unit', {
    prisonerCount: () => cy.get('[data-qa="prisonerCount"]'),
    getRow: i => ({
      prisoner: () => col(i, 0).find('a'),
      prisonNumber: () => col(i, 1),
      location: () => col(i, 2),
      arrivalDate: () => col(i, 3),
      changeAlertLink: () => col(i, 5),
    }),
  })

export default {
  verifyOnPage: notInUnitPage,
  goTo: () => {
    cy.visit('/current-covid-units/not-in-unit')
    return notInUnitPage()
  },
}
