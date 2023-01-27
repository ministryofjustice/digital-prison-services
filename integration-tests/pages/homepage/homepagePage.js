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
    checkMyDiary: () => cy.get('[data-test="check-my-diary"]'),
    changeSomeonesCell: () => cy.get('[data-test="change-someones-cell"]'),
    pom: () => cy.get('[data-test="pom"]'),
    soc: () => cy.get('[data-test="soc"]'),
    feedbackBanner: () => cy.get('[data-test="feedback-banner"]'),
    sendLegalMail: () => cy.get('[data-test="check-rule39-mail"]'),
    welcomePeopleIntoPrison: () => ({
      tile: () => cy.get('[data-test="welcome-people-into-prison"]'),
      title: () => cy.get('[data-test="welcome-people-into-prison"] h2'),
      link: () => cy.get('[data-test="welcome-people-into-prison"] a'),
      description: () => cy.get('[data-test="welcome-people-into-prison"] p'),
    }),
    manageRestrictedPatients: () => ({
      tile: () => cy.get('[data-test="manage-restricted-patients"]'),
      title: () => cy.get('[data-test="manage-restricted-patients"] h2'),
      link: () => cy.get('[data-test="manage-restricted-patients"] a'),
      description: () => cy.get('[data-test="manage-restricted-patients"] p'),
    }),
    incentives: () => ({
      tile: () => cy.get('[data-test="incentives"]'),
      title: () => cy.get('[data-test="incentives"] h2'),
      link: () => cy.get('[data-test="incentives"] a'),
      description: () => cy.get('[data-test="incentives"] p'),
    }),
    getSomeoneReadyToWork: () => ({
      tile: () => cy.get('[data-test="get-someone-ready-to-work"]'),
      title: () => cy.get('[data-test="get-someone-ready-to-work"] h2'),
      link: () => cy.get('[data-test="get-someone-ready-to-work"] a'),
      description: () => cy.get('[data-test="get-someone-ready-to-work"] p'),
    }),
  })

export default {
  verifyOnPage: homepagePage,
  goTo: () => {
    cy.visit(`/`)
    return homepagePage()
  },
}
