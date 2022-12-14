const page = require('../page')

const adjudicationHistoryPage = (offenderName) =>
  page(`${offenderName} adjudication history`, {
    form: () => ({
      establishment: () => cy.get('#agencyId'),
      finding: () => cy.get('#finding'),
      fromDate: () => cy.get('#fromDate'),
      toDate: () => cy.get('#toDate'),
      applyFilters: () => cy.get('[type="submit"]'),
    }),
    noRecordsFoundMessage: () => cy.get('[data-qa="no-records-found-message"]'),
    tableRows: () => cy.get('[data-qa="adjudications-history-table"]'),
    errorSummaryTitle: () => cy.get('govuk-error-summary'),
    errorSummaryList: () => cy.get('.govuk-error-summary__list'),
    feedbackBannerTitle: () => cy.get('[data-qa="feedback-survey-header"]'),
    feedbackBannerLink: () => cy.get('[data-qa="feedback-survey-link"]'),
  })

export default {
  verifyOnPage: adjudicationHistoryPage,
  goTo: (offenderNo, offenderName) => {
    cy.visit(`/offenders/${offenderNo}/adjudications`)
    return adjudicationHistoryPage(offenderName)
  },
}
