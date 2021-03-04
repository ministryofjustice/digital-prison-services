module.exports = cy => {
  const datePicker = () => cy.get('[name=search-date]')
  const datePickerText = () => cy.get('[name=search-date]').text()
  const datePickerTopBar = () => cy.get('.rdtSwitch')
  const getPickerYearSelector = year => cy.get(`.rdtYear:contains(${year})`)
  const getPickerMonthSelector = month => cy.get(`.rdtMonth:contains(${month})`)
  const getPickerMonthByIndexSelector = index => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return cy.get(`.rdtMonth:contains(${months[index]})`)
  }
  const getPickerDaySelector = day =>
    cy
      .get(`.rdtDay[data-value="${day}"]`)
      .not('.rdtNew')
      .not('.rdtOld')

  const pickDate = (day, month, year) => {
    datePicker().click()
    datePickerTopBar().click()
    datePickerTopBar().click()
    getPickerYearSelector(year).click()
    getPickerMonthByIndexSelector(month).click()
    getPickerDaySelector(day).click()
  }

  return {
    pickDate,
  }
}
