const page = require('../page')

const homepagePage = (title = 'DPS Home page') =>
  page(title, {
    fallbackHeaderUserName: () => cy.get('[data-qa=header-user-name]'),
    activeLocation: () => cy.get('[data-test="active-location"]'),
    manageAccountLink: () => cy.get('[data-test="manage-account-link"]'),
    searchForm: () => cy.get('[data-test="homepage-search-form"]'),
    searchKeywords: () => cy.get('[data-test="homepage-search-keywords"]'),
    searchLocation: () => cy.get('[data-test="homepage-search-location"]'),
    globalSearch: () => cy.get('[data-test="global-search"]'),
    managePrisonerWhereabouts: () => cy.get('[data-test="manage-prisoner-whereabouts"]'),
    useOfForce: () => cy.get('[data-test="use-of-force"]'),
    hdcLicences: () => cy.get('[data-test="hdc-licences"]'),
    establishmentRoll: () => cy.get('[data-test="establishment-roll"]'),
    manageUsers: () => cy.get('[data-test="manage-users"]'),
    categorisation: () => cy.get('[data-test="categorisation"]'),
    secureMove: () => cy.get('[data-test="secure-move"]'),
    checkMyDiary: () => cy.get('[data-test="check-my-diary"]'),
    changeSomeonesCell: () => cy.get('[data-test="change-someones-cell"]'),
    pom: () => cy.get('[data-test="pom"]'),
    feedbackBanner: () => cy.get('[data-test="feedback-banner"]'),
    sendLegalMail: () => cy.get('[data-test="check-rule39-mail"]'),
    welcomePeopleIntoPrison: () => ({
      tile: () => cy.get('[data-test="welcome-people-into-prison"]'),
      title: () => cy.get('[data-test="welcome-people-into-prison"] h2'),
      link: () => cy.get('[data-test="welcome-people-into-prison"] a'),
      description: () => cy.get('[data-test="welcome-people-into-prison"] p'),
    }),
    mercurySubmitPrivateBeta: () => ({
      tile: () => cy.get('[data-test="submit-an-intelligence-report-private-beta"]'),
      title: () => cy.get('[data-test="submit-an-intelligence-report-private-beta"] h2'),
      link: () => cy.get('[data-test="submit-an-intelligence-report-private-beta"] a'),
      description: () => cy.get('[data-test="submit-an-intelligence-report-private-beta"] p'),
    }),
    manageRestrictedPatients: () => ({
      tile: () => cy.get('[data-test="manage-restricted-patients"]'),
      title: () => cy.get('[data-test="manage-restricted-patients"] h2'),
      link: () => cy.get('[data-test="manage-restricted-patients"] a'),
      description: () => cy.get('[data-test="manage-restricted-patients"] p'),
    }),
    getSomeoneReadyToWork: () => ({
      tile: () => cy.get('[data-test="get-someone-ready-to-work"]'),
      title: () => cy.get('[data-test="get-someone-ready-to-work"] h2'),
      link: () => cy.get('[data-test="get-someone-ready-to-work"] a'),
      description: () => cy.get('[data-test="get-someone-ready-to-work"] p'),
    }),
    manageOffences: () => ({
      tile: () => cy.get('[data-test="manage-offences"]'),
      title: () => cy.get('[data-test="manage-offences"] h2'),
      link: () => cy.get('[data-test="manage-offences"] a'),
      description: () => cy.get('[data-test="manage-offences"] p'),
    }),

    commonComponentsHeader: () => cy.get('h1').contains('Common Components Header'),
    commonComponentsFooter: () => cy.get('h1').contains('Common Components Footer'),
  })

export default {
  verifyOnPage: homepagePage,
  goTo: () => {
    cy.visit(`/`)
    return homepagePage()
  },
  homepagePage,
}
