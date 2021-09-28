const page = require('../page')

const amendmentPage = (name) =>
  page(`Add more details to ${name}’s case note`, {
    prisonNumber: () => cy.get('[data-qa="prison-number"]'),
    typeSubType: () => cy.get('[data-qa="type-subtype"]'),
    amendments: () => cy.get('[data-qa="amendment"]'),
    moreDetail: () => cy.get('[name="moreDetail"]'),
    save: () => cy.get('[type="submit"]'),
    omicOpenWarning: () => cy.get('[data-test="omic-open-warning"]'),
    omicOpenHint: () => cy.get('[data-test="omic-open-hint"]'),
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    errorSummaryList: () => cy.get('.govuk-error-summary__list'),
  })

export default {
  verifyOnPage: (name) => amendmentPage(name),
}
