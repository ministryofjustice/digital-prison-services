const page = require('../page')

const moveValidationPage = () =>
  page('Are you sure you want to select this cell?', {
    nonAssociationsTitle: () => cy.get("[data-test='non-associations-heading']"),
    csraTitle: () => cy.get("[data-test='csra-heading']"),
    alertsTitle: () => cy.get("[data-test='alerts-heading']"),
    nonAssociationsSubTitle: () => cy.get("[data-test='non-associations-sub-heading']"),
    nonAssociationsSummary: () => cy.get("[data-test*='non-association-summary']"),
    csraSubTitle: () => cy.get("[data-test='csra-sub-heading']"),
    csraMessage: () => cy.get("[data-test='csra-message']"),
    alertsSubTitle: () => cy.get("[data-test='alerts-sub-heading']"),
    offenderAlertMessages: () => cy.get("[data-test='offender-alert-message']"),
    occupantAlertMessages: () => cy.get("[data-test='occupant-alert-message']"),
    alertsDetails: () => cy.get("[data-test='alert-details']"),
    alertsDates: () => cy.get("[data-test='alert-date']"),
    alertsComments: () => cy.get("[data-test='alert-comment']"),
    categoryWarning: () => cy.get("[data-test='category-warning']"),
    errorSummary: () => cy.get('.govuk-error-summary'),
    form: () => ({
      confirmationYes: () => cy.get('#confirmation'),
      confirmationNo: () => cy.get('#confirmation-2'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
  })

export default {
  verifyOnPage: moveValidationPage,
  goTo: (offenderNo, cellId) => {
    cy.visit(`/prisoner/${offenderNo}/cell-move/move-validation?cellId=${cellId}`)
    return moveValidationPage()
  },
}
