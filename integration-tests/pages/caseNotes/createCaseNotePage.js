const page = require('../page')

const createCaseNotePage = () =>
  page('Add a case note for', {
    prisonNumber: () => cy.get('[data-test="prison-number"]'),
    form: () => ({
      type: () => cy.get('#type'),
      subType: () => cy.get('#sub-type'),
      text: () => cy.get('#text'),
      hours: () => cy.get('#hours'),
      minutes: () => cy.get('#minutes'),
      date: () => cy.get('#date'),
      datePicker: () => cy.get('#ui-datepicker-div'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    activeDate: () => cy.get('.ui-state-active'),
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    errorSummaryList: () => cy.get('.govuk-error-summary__list'),
    omicOpenWarning: () => cy.get('[data-test="omic-open-warning"]'),
    omicOpenHint: () => cy.get('[data-test="omic-open-hint"]'),
  })

export default {
  verifyOnPage: createCaseNotePage,
  goTo: (offenderNo) => {
    cy.visit(`/prisoner/${offenderNo}/add-case-note`)
    return createCaseNotePage()
  },
}
