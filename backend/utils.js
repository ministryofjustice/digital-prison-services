const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC } = require('../src/dateHelpers')

const switchDateFormat = (displayDate, fromFormat = 'DD/MM/YYYY') => {
  if (displayDate) {
    return moment(displayDate, fromFormat).format('YYYY-MM-DD')
  }

  return displayDate
}

const readableDateFormat = (displayDate, fromFormat = 'DD/MM/YYYY') => {
  if (displayDate) {
    return moment(displayDate, fromFormat).format('D MMMM YYYY')
  }
  return displayDate
}

const formatTimestampToDate = timestamp => timestamp && moment(timestamp).format('DD/MM/YYYY')

const formatTimestampToDateTime = (timestamp, format = 'DD/MM/YYYY - HH:mm') =>
  timestamp && moment(timestamp).format(format)

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

const capitalizeStart = string => string && string[0].toUpperCase() + string.slice(1, string.length)

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

const isViewableFlag = code =>
  ['HA', 'XEL', 'PEEP', 'RNO121', 'RCON', 'RCDR', 'URCU', 'UPIU', 'USU', 'URS'].includes(code)

const arrayToQueryString = (array, key) => array && array.map(item => `${key}=${encodeURIComponent(item)}`).join('&')

const mapToQueryString = params =>
  Object.keys(params)
    .filter(key => params[key])
    .map(key => {
      if (Array.isArray(params[key])) return arrayToQueryString(params[key], key)
      return `${key}=${encodeURIComponent(params[key])}`
    })
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
  value &&
  value.substring(0, 1) +
    value
      .substring(1)
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()

const merge = (left, right) => ({
  ...left,
  ...right,
})

const isToday = date => {
  if (date === 'Today') return true

  return moment(date, 'DD/MM/YYYY')
    .startOf('day')
    .isSame(moment().startOf('day'))
}

const isTodayOrAfter = date => {
  if (isToday(date)) return true

  const searchDate = moment(date, 'DD/MM/YYYY')
  return searchDate.isSameOrAfter(moment(), 'day')
}

const getCurrentPeriod = date => {
  const afternoonSplit = 12
  const eveningSplit = 17
  const currentHour = moment(date).format('H')

  if (currentHour < afternoonSplit) return 'AM'
  if (currentHour < eveningSplit) return 'PM'
  return 'ED'
}

const isValidDateTimeFormat = dateTimeString => moment(dateTimeString, DATE_TIME_FORMAT_SPEC, true).isValid()

const getDate = (dateTimeString, format = 'dddd D MMMM YYYY') => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format(format)
}

const getTime = dateTimeString => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format('HH:mm')
}

const forenameToInitial = name => {
  if (!name) return null
  return `${name.charAt()} ${name.split(' ').pop()}`
}

const stripAgencyPrefix = (location, agency) => {
  const parts = location && location.split('-')
  if (parts && parts.length > 0) {
    const index = parts.findIndex(p => p === agency)
    if (index >= 0) {
      return location.substring(parts[index].length + 1, location.length)
    }
  }

  return null
}

const chunkArray = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size))

// anything with a number is considered not to be a name, so therefore an identifier (prison no, PNC no etc.)
const isPrisonerIdentifier = string => /\d/.test(string)

const isAfterToday = date => {
  const dayAfter = moment().add(1, 'day')
  const daysDifference = moment(date).diff(dayAfter, 'day')
  return daysDifference >= 0
}

const isBeforeToday = date => !(isToday(date) || isAfterToday(date))

const hyphenatedStringToCamel = string =>
  string.replace(/[-\s]([a-z])/g, char => {
    return char[1].toUpperCase()
  })

const formatCurrency = (number, currency) =>
  number === 0 || number ? number.toLocaleString('en-GB', { style: 'currency', currency: currency || 'GBP' }) : ''

const capitalizeUppercaseString = string =>
  string
    ? string
        .split(' ')
        .map(name => capitalize(name))
        .join(' ')
    : null

const putLastNameFirst = (firstName, lastName) => {
  if (!firstName && !lastName) return null
  if (!firstName && lastName) return properCaseName(lastName)
  if (firstName && !lastName) return properCaseName(firstName)

  return `${properCaseName(lastName)}, ${properCaseName(firstName)}`
}

const hasLength = array => array && array.length > 0

const getNamesFromString = string => {
  return (
    string &&
    string
      .split(', ')
      .reverse()
      .map(name => properCaseName(name))
  )
}

const groupBy = (array, key) => {
  return (
    array &&
    array.reduce((acc, current) => {
      const group = current[key]

      return { ...acc, [group]: [...(acc[group] || []), current] }
    }, {})
  )
}

const times = number => func => {
  const iter = index => {
    if (index === number) return
    func(index)
    iter(index + 1)
  }
  return iter(0)
}

const possessive = string => {
  if (!string) return ''

  return `${string}${string.toLowerCase().endsWith('s') ? '’' : '’s'}`
}

const indefiniteArticle = string =>
  ['a', 'e', 'i', 'o', 'u'].some(vowel => string.toLowerCase().startsWith(vowel)) ? 'an' : 'a'

const extractLocation = (location, agencyId) => {
  if (!location || !agencyId) return undefined
  const withoutAgency = stripAgencyPrefix(location, agencyId)
  if (withoutAgency.includes('RECP')) return 'Reception'
  if (withoutAgency.includes('CSWAP')) return 'Cell swap'
  return withoutAgency
}

module.exports = {
  isBeforeToday,
  isToday,
  isTodayOrAfter,
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
  getCurrentPeriod,
  readableDateFormat,
  getDate,
  getTime,
  forenameToInitial,
  stripAgencyPrefix,
  chunkArray,
  capitalizeStart,
  isPrisonerIdentifier,
  isAfterToday,
  hyphenatedStringToCamel,
  formatCurrency,
  capitalizeUppercaseString,
  putLastNameFirst,
  hasLength,
  getNamesFromString,
  groupBy,
  times,
  possessive,
  extractLocation,
  indefiniteArticle,
}
