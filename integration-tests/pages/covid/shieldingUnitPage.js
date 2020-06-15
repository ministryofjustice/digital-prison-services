const page = require('../page')

const col = (i, j) =>
  cy
    .get(`[data-qa=shielding-table] tbody tr`)
    .eq(i)
    .find('td')
    .eq(j)

const shieldingUnitPage = () =>
  page('Prisoners in the Shielding Unit', {
    prisonerCount: () => cy.get('[data-qa="prisonerCount"]'),
    getRow: i => ({
      prisoner: () => col(i, 0).find('a'),
      prisonNumber: () => col(i, 1),
      location: () => col(i, 2),
      dateAdded: () => col(i, 3),
      changeAlertLink: () => col(i, 5),
    }),
  })

export default {
  verifyOnPage: shieldingUnitPage,
  goTo: () => {
    cy.visit('/current-covid-units/shielding-unit')
    return shieldingUnitPage()
  },
}
