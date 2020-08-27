const page = require('../page')

const cellSharingRiskAssessmentDetailsPage = () =>
  page('CSRA details', {
    backLink: () => cy.get("[data-test='back-link']"),
    profileLink: () => cy.get("[data-test='profile-link']"),
  })

export default {
  verifyOnPage: cellSharingRiskAssessmentDetailsPage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/cell-sharing-risk-assessment-details`)
    return cellSharingRiskAssessmentDetailsPage()
  },
}
