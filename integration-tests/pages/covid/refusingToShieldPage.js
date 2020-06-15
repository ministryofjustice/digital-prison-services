const page = require('../page')

const col = (i, j) =>
  cy
    .get(`[data-qa=refusing-to-shield-table] tbody tr`)
    .eq(i)
    .find('td')
    .eq(j)

const refusingToShieldPage = () =>
  page('Prisoners refusing to shield', {
    prisonerCount: () => cy.get('[data-qa="prisonerCount"]'),
    getRow: i => ({
      prisoner: () => col(i, 0).find('a'),
      prisonNumber: () => col(i, 1),
      location: () => col(i, 2),
      changeAlertLink: () => col(i, 3),
    }),
  })

export default {
  verifyOnPage: refusingToShieldPage,
  goTo: () => {
    cy.visit('/current-covid-units/refusing-to-shield')
    return refusingToShieldPage()
  },
}
