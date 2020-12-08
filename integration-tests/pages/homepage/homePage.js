const page = require('../page')

const homePage = () =>
  page('Digital Prison Services', {
    globalSearch: () => cy.get('[data-test="global-search"]'),
    managePrisonerWhereabouts: () => cy.get('[data-test="manage-prisoner-whereabouts"]'),
    covidUnits: () => cy.get('[data-test="covid-units"]'),
    useOfForce: () => cy.get('[data-test="use-of-force"]'),
    pathfinder: () => cy.get('[data-test="pathfinder"]'),
    hdcLicences: () => cy.get('[data-test="hdc-licences"]'),
    establishmentRoll: () => cy.get('[data-test="establishment-roll"]'),
    bulkAppointments: () => cy.get('[data-test="bulk-appointments"]'),
    manageKeyWorkers: () => cy.get('[data-test="manage-key-workers"]'),
    manageUsers: () => cy.get('[data-test="manage-users"]'),
    categorisation: () => cy.get('[data-test="categorisation"]'),
    secureMove: () => cy.get('[data-test="secure-move"]'),
    pom: () => cy.get('[data-test="pom"]'),
    soc: () => cy.get('[data-test="soc"]'),
  })

export default {
  verifyOnPage: homePage,
  goTo: () => {
    cy.visit(`/home-page`)
    return homePage()
  },
}
