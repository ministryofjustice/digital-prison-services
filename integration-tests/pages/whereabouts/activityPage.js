const page = require('../page')

const activityPage = title =>
  page(title, {
    getActivityTotals: () => cy.get('[name=total-number]'),
    getAllResultRows: () => cy.get('table.row-gutters'),
    getResultBodyRows: () => cy.get('table.row-gutters > tbody > tr'),
    getResultActivity: () => cy.get('table.row-gutters > tbody > tr td:nth-child(7)'),
    getResultLocations: () => cy.get('table.row-gutters > tbody > tr td:nth-child(3)'),
    getResultAlerts: () => cy.get('table.row-gutters > tbody > tr td:nth-child(6)'),
    getResultEventsElsewhere: () => cy.get('table.row-gutters > tbody > tr td:nth-child(8)'),
    getResultNomsIds: () => cy.get('table.row-gutters > tbody > tr td:nth-child(4)'),
    sortSelect: () => cy.get('#sort-select'),
    datePicker: () => cy.get('[name=search-date]'),
    datePickerText: () => cy.get('[name=search-date]').text(),
    datePickerTopBar: () => cy.get('.rdtSwitch'),
    getPickerYearSelector: year => cy.get(`.rdtYear:contains(${year})`),
    getPickerMonthSelector: month => cy.get(`.rdtMonth:contains(${month})`),
    getPickerDaySelector: day =>
      cy
        .get(`.rdtDay[data-value="1"]`)
        .not('.rdtNew')
        .not('.rdtOld'),
    getAttendedValues: () => cy.get('td[data-qa="pay-option"] input'),
    getAbsenceReasons: () => cy.get('td[data-qa="other-option"]'),
    getAbsenceReasonsInput: () => cy.get('td[data-qa="other-option"] input'),
    fillOutAbsentReason: () => {
      cy.get('.ReactModalPortal form').within($form => {
        cy.get('input[name="pay"]').check('yes')
        cy.get('select[name="absentReason"]').select('AcceptableAbsence')
        cy.get('textarea[name="comments"]').type('test')
        cy.get('button[name="confirm"]').click()
      })
    },
  })

export default {
  verifyOnPage: activityPage,
}
