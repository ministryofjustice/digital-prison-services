const page = require('../page')

const homepagePage = () =>
  page('Digital Prison Services', {
    loggedInName: () => cy.get('[data-test="logged-in-name"]'),
    activeLocation: () => cy.get('[data-test="active-location"]'),
    manageAccountLink: () => cy.get('[data-test="manage-account-link"]'),
    changeLocationLink: () => cy.get('[data-test="change-location-link"]'),
    searchForm: () => cy.get('[data-test="homepage-search-form"]'),
    searchKeywords: () => cy.get('[data-test="homepage-search-keywords"]'),
    searchLocation: () => cy.get('[data-test="homepage-search-location"]'),
    globalSearch: () => cy.get('[data-test="global-search"]'),
    managePrisonerWhereabouts: () => cy.get('[data-test="manage-prisoner-whereabouts"]'),
    useOfForce: () => cy.get('[data-test="use-of-force"]'),
    pathfinder: () => cy.get('[data-test="pathfinder"]'),
    hdcLicences: () => cy.get('[data-test="hdc-licences"]'),
    establishmentRoll: () => cy.get('[data-test="establishment-roll"]'),
    manageKeyWorkers: () => cy.get('[data-test="manage-key-workers"]'),
    manageUsers: () => cy.get('[data-test="manage-users"]'),
    categorisation: () => cy.get('[data-test="categorisation"]'),
    secureMove: () => cy.get('[data-test="secure-move"]'),
    changeSomeonesCell: () => cy.get('[data-test="change-someones-cell"]'),
    pom: () => cy.get('[data-test="pom"]'),
    soc: () => cy.get('[data-test="soc"]'),
    feedbackBanner: () => cy.get('[data-test="feedback-banner"]'),
  })

export default {
  verifyOnPage: homepagePage,
  goTo: () => {
    cy.visit(`/`)
    return homepagePage()
  },
}
