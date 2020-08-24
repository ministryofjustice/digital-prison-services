const page = require('../page')

const offenderDetailsPage = () =>
  page('Prisoner details', {
    backLink: () => cy.get("[data-test='back-link']"),
    profileLink: () => cy.get("[data-test='profile-link']"),
  })

export default {
  verifyOnPage: offenderDetailsPage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/offender-details`)
    return offenderDetailsPage()
  },
}
