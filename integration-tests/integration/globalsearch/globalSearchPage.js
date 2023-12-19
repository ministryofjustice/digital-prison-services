const page = require('../../pages/page')

const globalSearchPage = () => {
  const globalSearch = page('Global search', {
    form: () => ({
      search: () => cy.get('[data-test="global-search-text"]'),
      submitButton: () => cy.get('[data-test="global-search-submit"]'),
    }),
    nextPage: () => cy.get('.moj-pagination__item--next').first(),
    previousPage: () => cy.get('.moj-pagination__item--prev').first(),
    showFilters: () => cy.get('[data-test="global-search-filters-container"] .govuk-details__summary-text'),
    clearFilters: () => cy.get('[data-test="clear-link"]'),
    locationSelect: () => cy.get('[data-test="location-filter"]'),
    genderSelect: () => cy.get('[data-test="gender-filter"]'),
    dobDay: () => cy.get('[data-test="dob-day"]'),
    dobMonth: () => cy.get('[data-test="dob-month"]'),
    dobYear: () => cy.get('[data-test="dob-year"]'),
    updateLicenceLinks: () => cy.get('[data-test="update-licence-link"]'),
    profileLinks: () => cy.get('[data-test="prisoner-profile-link"]'),
    prisonerImages: () => cy.get('[data-test="prisoner-image"]'),
    resultsTable: () => cy.get('[data-test="global-search-results-table"]'),
  })
  return globalSearch
}

export default {
  verifyOnPage: globalSearchPage,
  verifyOnResultsPage: () => globalSearchPage(true),
}
