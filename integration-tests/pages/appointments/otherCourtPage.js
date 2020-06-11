const page = require('../page')

const otherCourtPage = () =>
  page('What is the name of the court?', {
    form: () => ({
      otherCourt: () => cy.get('#otherCourt'),
      submitButton: () => cy.get('button[type="submit"]'),
      cancelButton: () => cy.get('.govuk-button--secondary'),
    }),
    errorSummary: () => cy.get('.govuk-error-summary'),
  })

export default {
  verifyOnPage: otherCourtPage,
}
