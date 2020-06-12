const page = require('../page')

const searchPage = () =>
  page('Manage prisoner whereabouts', {
    activity: () => cy.get('#activity-select'),
    period: () => cy.get('#period-select'),
    location: () => cy.get('#housing-location-select'),
    continueActivityButton: () => cy.get('#continue-activity'),
  })

export default {
  verifyOnPage: searchPage,
}
