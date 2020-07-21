const page = require('../page')

const createAlertPage = () =>
  page('Create an alert for', {
    prisonNumber: () => cy.get('.govuk-caption-l'),
    form: () => ({
      alertType: () => cy.get('#alert-type'),
      alertCode: () => cy.get('#alert-code'),
      comments: () => cy.get('#comments'),
      datePicker: () => cy.get('#ui-datepicker-div'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    activeDate: () => cy.get('.ui-state-active'),
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    errorSummaryList: () => cy.get('.govuk-error-summary__list'),
  })

export default {
  verifyOnPage: createAlertPage,
  goTo: offenderNo => {
    cy.visit(`/offenders/${offenderNo}/create-alert`)
    return createAlertPage()
  },
}
