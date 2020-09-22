const page = require('../page')

const editAlertPage = () =>
  page('Change or close alert', {
    prisonNumber: () => cy.get('.govuk-caption-l'),
    form: () => ({
      comments: () => cy.get('#comment'),
      alertStatusYes: () => cy.get('#alertStatus'),
      alertStatusNo: () => cy.get('#alertStatus-2'),
      submitButton: () => cy.get('button[type="submit"]'),
      cancelButton: () => cy.get('.govuk-button--secondary'),
    }),
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    errorSummaryList: () => cy.get('.govuk-error-summary__list'),
  })

export default {
  verifyOnPage: editAlertPage,
  goTo: (offenderNo, alertId) => {
    cy.visit(`/edit-alert?offenderNo=${offenderNo}&alertId=${alertId}`)
    return editAlertPage()
  },
}
