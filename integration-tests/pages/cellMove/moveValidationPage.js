const page = require('../page')

const moveValidationPage = () =>
  page('Are you sure you want to select this cell?', {
    nonAssociationsTitle: () => cy.get("[data-test='non-associations-heading']"),
    csraTitle: () => cy.get("[data-test='csra-heading']"),
    alertsTitle: () => cy.get("[data-test='alerts-heading']"),
    nonAssociationsSubTitle: () => cy.get("[data-test='non-associations-sub-heading']"),
    csraSubTitle: () => cy.get("[data-test='csra-sub-heading']"),
    csraMessage: () => cy.get("[data-test='csra-message']"),
    alertsSubTitle: () => cy.get("[data-test='alerts-sub-heading']"),
    offenderAlerts: () => cy.get("[data-test='offender-alert-detail']"),
    occupantAlerts: () => cy.get("[data-test='occupant-alert-detail']"),
    form: () => ({
      confirmationYes: () => cy.get('#confirmation'),
      confirmationNo: () => cy.get('#confirmation-2'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
  })

export default {
  verifyOnPage: moveValidationPage,
  goTo: (offenderNo, cellId) => {
    console.log(cellId)
    cy.visit(`/prisoner/${offenderNo}/cell-move/move-validation?cellId=${cellId}`)
    return moveValidationPage()
  },
}
