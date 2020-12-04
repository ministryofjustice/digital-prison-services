const page = require('../page')

const homePage = () =>
  page('Digital prison services', {
    globalSearch: () => cy.get('#global-search'),
    manageKeyworkers: () => cy.get('#manage-key-workers'),
  })

export default {
  verifyOnPage: homePage,
  goTo: () => {
    cy.visit(`/home-page`)
    return homePage()
  },
}
