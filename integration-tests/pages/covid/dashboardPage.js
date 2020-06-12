const page = require('../page')

const dashboardPage = () =>
  page('Current breakdown of COVID units', {
    prisonPopulation: () => cy.get('[data-qa="prisonPopulation"]'),
    reverseCohortingUnit: () => cy.get('[data-qa="reverseCohortingUnit"]'),
    protectiveIsolationUnit: () => cy.get('[data-qa="protectiveIsolationUnit"]'),
    shieldingUnit: () => cy.get('[data-qa="shieldingUnit"]'),
    refusingToShield: () => cy.get('[data-qa="refusingToShield"]'),
  })

export default {
  verifyOnPage: dashboardPage,
  goTo: () => {
    cy.visit('/current-covid-units')
    return dashboardPage()
  },
}
