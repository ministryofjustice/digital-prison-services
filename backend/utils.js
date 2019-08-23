const moment = require('moment')

const switchDateFormat = (displayDate, format) => {
  if (displayDate) {
    return moment(displayDate, format || 'DD/MM/YYYY').format('YYYY-MM-DD')
  }
  return displayDate
}

const formatTimestampToDate = timestamp => timestamp && moment(timestamp).format('DD/MM/YYYY')

const formatTimestampToDateTime = timestamp => timestamp && moment(timestamp).format('DD/MM/YYYY - HH:mm')

const distinct = data =>
  data.reduce((accumulator, current) => (accumulator.includes(current) ? accumulator : [...accumulator, current]), [])

const sortByDateTime = (t1, t2) => {
  if (t1 && t2) {
    return moment(t1).valueOf() - moment(t2).valueOf()
  }
  if (t1) return -1
  if (t2) return 1
  return 0
}

const capitalize = string => {
  if (typeof string !== 'string') return ''
  const lowerCase = string.toLowerCase()
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1)
}

const isBlank = str => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = name =>
  isBlank(name)
    ? ''
    : name
        .split('-')
        .map(capitalize)
        .join('-')

const formatName = (firstName, lastName) =>
  [properCaseName(firstName), properCaseName(lastName)].filter(Boolean).join(' ')

const isViewableFlag = code => ['HA', 'XEL'].includes(code)

const arrayToQueryString = (array, key) => array && array.map(item => `${key}=${item}`).join('&')

const mapToQueryString = params =>
  Object.keys(params)
    .filter(key => params[key])
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')

const toMap = (key, array) =>
  array.reduce((map, current) => {
    if (map.has(current[key]) === false) {
      map.set(current[key], current)
    }
    return map
  }, new Map())

const formatValue = (quantity, label) => {
  if (!quantity) {
    return ''
  }
  return `${quantity} ${label}${quantity > 1 ? 's' : ''}`
}

/**
 * Converts a number to a combination of years and days.
 * This is not a date difference conversion, so it doesn't
 * take into account leap years. Used to clearer display
 * rather than date calculations.
 * @param days
 * @returns {string}
 */
const formatDaysInYears = days => {
  const years = Math.floor(days / 365)
  const remainingDays = days % 365
  const yearString = formatValue(years, 'year')
  const joinString = years > 0 && remainingDays > 0 ? ', ' : ''
  const dayString = formatValue(remainingDays, 'day')
  return `${yearString}${joinString}${dayString}`
}

const formatMonthsAndDays = (months, days) => {
  const monthString = formatValue(months, 'month')
  const joinString = months > 0 && days > 0 ? ', ' : ''
  const dayString = formatValue(days, 'day')
  return `${monthString}${joinString}${dayString}`
}

const pascalToString = value =>
  value.substring(0, 1) +
  value
    .substring(1)
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()

const merge = (left, right) => ({
  ...left,
  ...right,
})

module.exports = {
  switchDateFormat,
  formatTimestampToDate,
  formatTimestampToDateTime,
  distinct,
  sortByDateTime,
  capitalize,
  isViewableFlag,
  arrayToQueryString,
  mapToQueryString,
  properCaseName,
  formatName,
  formatDaysInYears,
  formatMonthsAndDays,
  toMap,
  pascalToString,
  merge,
}
