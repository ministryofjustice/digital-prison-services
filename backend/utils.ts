// @ts-expect-error ts-migrate(6200) FIXME: Definitions of the following identifiers conflict ... Remove this comment to see the full error message
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'DATE_TIME_... Remove this comment to see the full error message
const { DATE_TIME_FORMAT_SPEC } = require('../common/dateHelpers')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'switchDate... Remove this comment to see the full error message
const switchDateFormat = (displayDate, fromFormat = 'DD/MM/YYYY') => {
  if (displayDate) {
    return moment(displayDate, fromFormat).format('YYYY-MM-DD')
  }

  return displayDate
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'readableDa... Remove this comment to see the full error message
const readableDateFormat = (displayDate, fromFormat = 'DD/MM/YYYY') => {
  if (displayDate) {
    return moment(displayDate, fromFormat).format('D MMMM YYYY')
  }
  return displayDate
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatTime... Remove this comment to see the full error message
const formatTimestampToDate = (timestamp, outputFormat = 'DD/MM/YYYY') =>
  timestamp && moment(timestamp).format(outputFormat)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatTime... Remove this comment to see the full error message
const formatTimestampToDateTime = (timestamp, format = 'DD/MM/YYYY - HH:mm') =>
  timestamp && moment(timestamp).format(format)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'distinct'.
const distinct = (data) =>
  data.reduce((accumulator, current) => (accumulator.includes(current) ? accumulator : [...accumulator, current]), [])

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sortByDate... Remove this comment to see the full error message
const sortByDateTime = (t1, t2) => {
  if (t1 && t2) return moment(t1).valueOf() - moment(t2).valueOf()
  if (t1) return -1
  if (t2) return 1
  return 0
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'capitalize... Remove this comment to see the full error message
const capitalize = (string) => {
  if (typeof string !== 'string') return ''
  const lowerCase = string.toLowerCase()
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1)
}

const capitalizeStart = (string) => string && string[0].toUpperCase() + string.slice(1, string.length)

const isBlank = (str) => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'properCase... Remove this comment to see the full error message
const properCaseName = (name) => (isBlank(name) ? '' : name.split('-').map(capitalize).join('-'))

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatName... Remove this comment to see the full error message
const formatName = (firstName, lastName) =>
  [properCaseName(firstName), properCaseName(lastName)].filter(Boolean).join(' ')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isViewable... Remove this comment to see the full error message
const isViewableFlag = (code) =>
  ['HA', 'XEL', 'PEEP', 'RNO121', 'RCON', 'RCDR', 'URCU', 'UPIU', 'USU', 'URS'].includes(code)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'arrayToQue... Remove this comment to see the full error message
const arrayToQueryString = (array, key) => array && array.map((item) => `${key}=${encodeURIComponent(item)}`).join('&')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'mapToQuery... Remove this comment to see the full error message
const mapToQueryString = (params) =>
  Object.keys(params)
    .filter((key) => params[key])
    .map((key) => {
      if (Array.isArray(params[key])) return arrayToQueryString(params[key], key)
      return `${key}=${encodeURIComponent(params[key])}`
    })
    .join('&')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'toMap'.
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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatDays... Remove this comment to see the full error message
const formatDaysInYears = (days) => {
  const years = Math.floor(days / 365)
  const remainingDays = days % 365
  const yearString = formatValue(years, 'year')
  const joinString = years > 0 && remainingDays > 0 ? ', ' : ''
  const dayString = formatValue(remainingDays, 'day')
  return `${yearString}${joinString}${dayString}`
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatMont... Remove this comment to see the full error message
const formatMonthsAndDays = (months, days) => {
  const monthString = formatValue(months, 'month')
  const joinString = months > 0 && days > 0 ? ', ' : ''
  const dayString = formatValue(days, 'day')
  return `${monthString}${joinString}${dayString}`
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'pascalToSt... Remove this comment to see the full error message
const pascalToString = (value) =>
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

const isToday = (date) => {
  if (date === 'Today') return true

  return moment(date, 'DD/MM/YYYY').startOf('day').isSame(moment().startOf('day'))
}

const isTodayOrAfter = (date) => {
  if (isToday(date)) return true

  const searchDate = moment(date, 'DD/MM/YYYY')
  return searchDate.isSameOrAfter(moment(), 'day')
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getCurrent... Remove this comment to see the full error message
const getCurrentPeriod = (date) => {
  const afternoonSplit = 12
  const eveningSplit = 17
  const currentHour = moment(date).format('H')

  if (currentHour < afternoonSplit) return 'AM'
  if (currentHour < eveningSplit) return 'PM'
  return 'ED'
}

const isValidDateTimeFormat = (dateTimeString) => moment(dateTimeString, DATE_TIME_FORMAT_SPEC, true).isValid()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getDate'.
const getDate = (dateTimeString, format = 'dddd D MMMM YYYY') => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format(format)
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getTime'.
const getTime = (dateTimeString) => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format('HH:mm')
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'forenameTo... Remove this comment to see the full error message
const forenameToInitial = (name) => {
  if (!name) return null
  return `${name.charAt()}. ${name.split(' ').pop()}`
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'stripAgenc... Remove this comment to see the full error message
const stripAgencyPrefix = (location, agency) => {
  const parts = location && location.split('-')
  if (parts && parts.length > 0) {
    const index = parts.findIndex((p) => p === agency)
    if (index >= 0) {
      return location.substring(parts[index].length + 1, location.length)
    }
  }

  return null
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chunkArray... Remove this comment to see the full error message
const chunkArray = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size))

// anything with a number is considered not to be a name, so therefore an identifier (prison no, PNC no etc.)
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isPrisoner... Remove this comment to see the full error message
const isPrisonerIdentifier = (string) => /\d/.test(string)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isAfterTod... Remove this comment to see the full error message
const isAfterToday = (date) => {
  const dayAfter = moment().add(1, 'day')
  const daysDifference = moment(date).diff(dayAfter, 'day')
  return daysDifference >= 0
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isBeforeTo... Remove this comment to see the full error message
const isBeforeToday = (date) => !(isToday(date) || isAfterToday(date))

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'hyphenated... Remove this comment to see the full error message
const hyphenatedStringToCamel = (string) => string.replace(/[-\s]([a-z])/g, (char) => char[1].toUpperCase())

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatCurr... Remove this comment to see the full error message
const formatCurrency = (number, currency) =>
  typeof number === 'number' ? number.toLocaleString('en-GB', { style: 'currency', currency: currency || 'GBP' }) : ''

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'capitalize... Remove this comment to see the full error message
const capitalizeUppercaseString = (string) =>
  string
    ? string
        .split(' ')
        .map((name) => capitalize(name))
        .join(' ')
    : null

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'putLastNam... Remove this comment to see the full error message
const putLastNameFirst = (firstName, lastName) => {
  if (!firstName && !lastName) return null
  if (!firstName && lastName) return properCaseName(lastName)
  if (firstName && !lastName) return properCaseName(firstName)

  return `${properCaseName(lastName)}, ${properCaseName(firstName)}`
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'hasLength'... Remove this comment to see the full error message
const hasLength = (array) => array && array.length > 0

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getNamesFr... Remove this comment to see the full error message
const getNamesFromString = (string) =>
  string &&
  string
    .split(', ')
    .reverse()
    .map((name) => properCaseName(name))

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'groupBy'.
const groupBy = (array, key) =>
  array &&
  array.reduce((acc, current) => {
    const group = current[key]

    return { ...acc, [group]: [...(acc[group] || []), current] }
  }, {})

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
const times = (number) => (func) => {
  const iter = (index) => {
    if (index === number) return
    func(index)
    iter(index + 1)
  }
  return iter(0)
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'possessive... Remove this comment to see the full error message
const possessive = (string) => {
  if (!string) return ''

  return `${string}${string.toLowerCase().endsWith('s') ? '’' : '’s'}`
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'indefinite... Remove this comment to see the full error message
const indefiniteArticle = (string) =>
  ['a', 'e', 'i', 'o', 'u'].some((vowel) => string.toLowerCase().startsWith(vowel)) ? 'an' : 'a'

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatLoca... Remove this comment to see the full error message
const formatLocation = (locationName) => {
  if (!locationName) return undefined
  if (locationName.includes('RECP')) return 'Reception'
  if (locationName.includes('CSWAP')) return 'No cell allocated'
  if (locationName.includes('COURT')) return 'Court'
  return locationName
}

const isTemporaryLocation = (locationName) => {
  if (!locationName) return false
  if (locationName.endsWith('RECP')) return true
  if (locationName.endsWith('CSWAP')) return true
  if (locationName.endsWith('COURT')) return true
  if (locationName.endsWith('TAP')) return true
  return false
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'extractLoc... Remove this comment to see the full error message
const extractLocation = (location, agencyId) => {
  if (!location || !agencyId) return undefined
  const withoutAgency = stripAgencyPrefix(location, agencyId)
  return formatLocation(withoutAgency)
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createStri... Remove this comment to see the full error message
const createStringFromList = (array) => {
  if (array.length > 1) {
    const lastItem = array.pop()
    return `${array.join(', ')} and ${lastItem}`
  }

  return array[0]
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isXHRReque... Remove this comment to see the full error message
const isXHRRequest = (req) =>
  req.xhr ||
  (req.headers.accept && (req.headers.accept.indexOf('json') > -1 || req.headers.accept.indexOf('image/*') > -1)) ||
  (req.path && req.path.endsWith('.js'))

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'joinUrlPat... Remove this comment to see the full error message
const joinUrlPath = (url, path) => {
  if (!url && !path) return url

  const endOfUrl = url[url.length - 1]
  const startOfPath = path[0]

  if (endOfUrl !== '/' && startOfPath !== '/') return `${url}/${path}`
  if (endOfUrl === '/' && startOfPath === '/') return url.substr(0, url.length - 1) + path

  return url + path
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getWith404... Remove this comment to see the full error message
const getWith404AsNull = async (apiCall) =>
  new Promise((resolve, reject) =>
    apiCall
      .then((details) => resolve(details))
      .catch((error) => {
        if (error?.response?.status === 404) resolve(null)
        reject(error)
      })
  )

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
  formatLocation,
  isTemporaryLocation,
  extractLocation,
  indefiniteArticle,
  isBlank,
  createStringFromList,
  isXHRRequest,
  joinUrlPath,
  getWith404AsNull,
}
