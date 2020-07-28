const page = require('../../pages/page')

const globalSearchPage = (results = false) =>
  page(`Global search${results ? ' results' : ''}`, {
    form: () => ({
      search: () => cy.get('#search-text'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    rows: () => cy.get('tr'),
    nextPage: () => cy.get('#next-page'),
    previousPage: () => cy.get('#previous-page'),
    showFilters: () => cy.get('#showFiltersLink'),
    clearFilters: () => cy.get('#clearFilters'),
    locationSelect: () => cy.get('#location-select'),
    genderSelect: () => cy.get('#gender-select'),
    dobDay: () => cy.get('input[type="number"]:eq(0)'),
    dobMonth: () => cy.get('input[type="number"]:eq(1)'),
    dobYear: () => cy.get('input[type="number"]:eq(2)'),
  })

export default {
  verifyOnPage: globalSearchPage,
  verifyOnResultsPage: () => globalSearchPage(true),
}
