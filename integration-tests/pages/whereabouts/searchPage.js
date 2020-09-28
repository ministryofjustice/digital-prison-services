const page = require('../page')

const searchPage = () =>
  page('Manage prisoner whereabouts', {
    activity: () => cy.get('#activity-select'),
    period: () => cy.get('#period-select'),
    location: () => cy.get('#housing-location-select'),
    continueActivityButton: () => cy.get('#continue-activity'),
    datePicker: () => cy.get('[name=search-date]'),
    datePickerText: () => cy.get('[name=search-date]').text(),
    datePickerTopBar: () => cy.get('.rdtSwitch'),
    getPickerYearSelector: year => cy.get(`.rdtYear:contains(${year})`),
    getPickerMonthSelector: month => cy.get(`.rdtMonth:contains(${month})`),
    getPickerDaySelector: () =>
      cy
        .get(`.rdtDay[data-value="1"]`)
        .not('.rdtNew')
        .not('.rdtOld'),
    validationMessage: () => cy.get('#validation-message'),
    errorMessage: () => cy.get('.error-message'),
  })

export default {
  verifyOnPage: searchPage,
  goTo: () => {
    cy.visit('/manage-prisoner-whereabouts')
    return searchPage()
  },
}
