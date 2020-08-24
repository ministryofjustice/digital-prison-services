const page = require('../page')

const retentionReasonsPage = () =>
  page('Prevent removal of this record', {
    offenderImage: () => cy.get('[data-qa="offender-image"]'),
    offenderName: () => cy.get('[data-qa="offender-name"]'),
    offenderNumber: () => cy.get('[data-qa="offender-no"]'),
    offenderDob: () => cy.get('[data-qa="dob"]'),
    offenderAgency: () => cy.get('[data-qa="agency"]'),
    checkBoxHighProfile: () => cy.get('#retention-reason-HIGH_PROFILE'),
    checkBoxOther: () => cy.get('#retention-reason-OTHER'),
    moreDetailOther: () => cy.get('#more-detail-OTHER'),
    updateButton: () => cy.get('button'),
    cancelButton: () => cy.get('a'),
    lastUpdateTimestamp: () => cy.get('#last-update-timestamp'),
    lastUpdateUser: () => cy.get('#last-update-user'),
    errorSummary: () => cy.get('.govuk-error-summary'),
  })

export default {
  verifyOnPage: retentionReasonsPage,
  goTo: offenderNo => {
    cy.visit(`/offenders/${offenderNo}/retention-reasons`)
    return retentionReasonsPage()
  },
}
