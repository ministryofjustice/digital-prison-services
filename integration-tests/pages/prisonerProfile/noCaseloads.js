const page = require('../page')

const noCaseloadPage = () =>
  page('You do not have permission to view this page', {
    homepageLink: () => cy.get('.govuk-link'),
  })

export default {
  verifyOnPage: noCaseloadPage,
}
