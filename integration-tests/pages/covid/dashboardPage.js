const page = require('../page')

const dashboardPage = () =>
  page('Current breakdown of COVID units', {
    prisonPopulation: () => cy.get('[data-qa="prisonPopulation"]'),

    reverseCohortingUnit: () => cy.get('[data-qa="reverseCohortingUnit"]'),
    reverseCohortingUnitLink: () => cy.get('[data-qa="reverseCohortingUnit-link"]'),

    notInUnit: () => cy.get('[data-qa=notInUnit]'),
    notInUnitLink: () => cy.get('[data-qa=notInUnit-link]'),

    protectiveIsolationUnit: () => cy.get('[data-qa="protectiveIsolationUnit"]'),
    protectiveIsolationUnitLink: () => cy.get('[data-qa="protectiveIsolationUnit-link"]'),

    shieldingUnit: () => cy.get('[data-qa="shieldingUnit"]'),
    shieldingUnitLink: () => cy.get('[data-qa="shieldingUnit-link"]'),

    refusingToShield: () => cy.get('[data-qa="refusingToShield"]'),
    refusingToShieldLink: () => cy.get('[data-qa="refusingToShield-link"]'),
  })

export default {
  verifyOnPage: dashboardPage,
  goTo: () => {
    cy.visit('/current-covid-units/')
    return dashboardPage()
  },
}
