const page = require('../page')

const createCaseNoteConfirmPage = () =>
  page('Is this information appropriate to share as an OMiC open case note?', {
    prisonNumber: () => cy.get('[data-test="prison-number"]'),
    form: () => ({
      confirmRadio: () => cy.get('[type="radio"]'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    errorSummaryTitle: () => cy.get('#error-summary-title'),
    errorSummaryList: () => cy.get('.govuk-error-summary__list'),
  })

export default {
  verifyOnPage: createCaseNoteConfirmPage,
  goTo: (offenderNo) => {
    cy.visit(`/prisoner/${offenderNo}/add-case-note/confirm`)
    return createCaseNoteConfirmPage()
  },
}
