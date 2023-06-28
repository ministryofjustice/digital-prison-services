const page = require('../page')

const considerRisksPage = () =>
  page('You must consider the risks of the prisoners involved', {
    nonAssociationsSubTitle: () => cy.get("[data-test='non-associations-sub-heading']"),
    nonAssociationsSummary: () => cy.get("[data-test*='non-association-summary']"),
    csraMessages: () => cy.get("[data-test='csra-messages']"),
    offenderAlertsHeading: () => cy.get("[data-test='offender-alerts-heading']"),
    occupantAlertsHeading: () => cy.get("[data-test='occupant-alerts-heading']"),
    offenderAlertMessages: () => cy.get("[data-test='offender-alert-message']"),
    occupantAlertMessages: () => cy.get("[data-test='occupant-alert-message']"),
    alertsDates: () => cy.get("[data-test='alert-date']"),
    alertsComments: () => cy.get("[data-test='alert-comment']"),
    categoryWarning: () => cy.get("[data-test='category-warning']"),
    errorSummary: () => cy.get('.govuk-error-summary'),
    form: () => ({
      confirmationInput: () => cy.get("[data-test='confirmation-input']"),
      confirmationYes: () => cy.get('#confirmation'),
      confirmationNo: () => cy.get('#confirmation-2'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
  })

export default {
  verifyOnPage: considerRisksPage,
  goTo: (offenderNo, cellId) => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/consider-risks?cellId=${cellId}`, { failOnStatusCode: false })
    return considerRisksPage()
  },
}
