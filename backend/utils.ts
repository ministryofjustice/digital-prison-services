import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../common/dateHelpers'
import abbreviations from '../common/abbreviations'

export const switchDateFormat = (displayDate, fromFormat = 'DD/MM/YYYY') => {
  if (displayDate) {
    return moment(displayDate, fromFormat).format('YYYY-MM-DD')
  }

  return displayDate
}

export const readableDateFormat = (displayDate, fromFormat = 'DD/MM/YYYY') => {
  if (displayDate) {
    return moment(displayDate, fromFormat).format('D MMMM YYYY')
  }
  return displayDate
}

export const formatTimestampToDate = (timestamp, outputFormat = 'DD/MM/YYYY') =>
  timestamp && moment(timestamp).format(outputFormat)

export const formatTimestampToDateTime = (timestamp, format = 'DD/MM/YYYY - HH:mm') =>
  timestamp && moment(timestamp).format(format)

export const distinct = (data) =>
  data.reduce((accumulator, current) => (accumulator.includes(current) ? accumulator : [...accumulator, current]), [])

export const sortByDateTime = (t1, t2) => {
  if (t1 && t2) return moment(t1).valueOf() - moment(t2).valueOf()
  if (t1) return -1
  if (t2) return 1
  return 0
}

export const capitalize = (string) => {
  if (typeof string !== 'string') return ''
  const lowerCase = string.toLowerCase()
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1)
}

export const capitalizeStart = (string) => string && string[0].toUpperCase() + string.slice(1, string.length)

export const isBlank = (str) => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
export const properCaseName = (name) => (isBlank(name) ? '' : name.split('-').map(capitalize).join('-'))

export const formatName = (firstName, lastName) =>
  [properCaseName(firstName), properCaseName(lastName)].filter(Boolean).join(' ')

export const isViewableFlag = (code) =>
  ['HA', 'XEL', 'PEEP', 'RNO121', 'RCON', 'RCDR', 'URCU', 'UPIU', 'USU', 'URS'].includes(code)

export const arrayToQueryString = (array, key) =>
  array && array.map((item) => `${key}=${encodeURIComponent(item)}`).join('&')

export const mapToQueryString = (params) =>
  Object.keys(params)
    .filter((key) => params[key])
    .map((key) => {
      if (Array.isArray(params[key])) return arrayToQueryString(params[key], key)
      return `${key}=${encodeURIComponent(params[key])}`
    })
    .join('&')

export const toMap = (key, array) =>
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
export const formatDaysInYears = (days) => {
  const years = Math.floor(days / 365)
  const remainingDays = days % 365
  const yearString = formatValue(years, 'year')
  const joinString = years > 0 && remainingDays > 0 ? ', ' : ''
  const dayString = formatValue(remainingDays, 'day')
  return `${yearString}${joinString}${dayString}`
}

export const formatMonthsAndDays = (months, days) => {
  const monthString = formatValue(months, 'month')
  const joinString = months > 0 && days > 0 ? ', ' : ''
  const dayString = formatValue(days, 'day')
  return `${monthString}${joinString}${dayString}`
}

export const pascalToString = (value) =>
  value &&
  value.substring(0, 1) +
    value
      .substring(1)
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()

export const merge = (left, right) => ({
  ...left,
  ...right,
})

export const isToday = (date) => {
  if (date === 'Today') return true

  return moment(date, 'DD/MM/YYYY').startOf('day').isSame(moment().startOf('day'))
}

export const isTodayOrAfter = (date) => {
  if (isToday(date)) return true

  const searchDate = moment(date, 'DD/MM/YYYY')
  return searchDate.isSameOrAfter(moment(), 'day')
}

export const getCurrentPeriod = (date) => {
  const afternoonSplit = 12
  const eveningSplit = 17
  const currentHour = parseInt(moment(date).format('H'), 10)

  if (currentHour < afternoonSplit) return 'AM'
  if (currentHour < eveningSplit) return 'PM'
  return 'ED'
}

const isValidDateTimeFormat = (dateTimeString) => moment(dateTimeString, DATE_TIME_FORMAT_SPEC, true).isValid()

export const getDate = (dateTimeString, format = 'dddd D MMMM YYYY') => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format(format)
}

export const getTime = (dateTimeString) => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format('HH:mm')
}

export const forenameToInitial = (name) => {
  if (!name) return null
  return `${name.charAt()}. ${name.split(' ').pop()}`
}

export const stripAgencyPrefix = (location, agency) => {
  const parts = location && location.split('-')
  if (parts && parts.length > 0) {
    const index = parts.findIndex((p) => p === agency)
    if (index >= 0) {
      return location.substring(parts[index].length + 1, location.length)
    }
  }

  return null
}

export const chunkArray = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size))

// anything with a number is considered not to be a name, so therefore an identifier (prison no, PNC no etc.)
export const isPrisonerIdentifier = (string) => /\d/.test(string)

export const isAfterToday = (date) => {
  const dayAfter = moment().add(1, 'day')
  const daysDifference = moment(date).diff(dayAfter, 'day')
  return daysDifference >= 0
}

export const isBeforeToday = (date) => !(isToday(date) || isAfterToday(date))

export const hyphenatedStringToCamel = (string) => string.replace(/[-\s]([a-z])/g, (char) => char[1].toUpperCase())

export const formatCurrency = (number, currency) =>
  typeof number === 'number' ? number.toLocaleString('en-GB', { style: 'currency', currency: currency || 'GBP' }) : ''

export const capitalizeUppercaseString = (string) => {
  if (!string) return null
  return string
    .replace('(', '( ')
    .split(' ')
    .map((name) => capitalize(name))
    .join(' ')
    .replace('( ', '(')
}

export const putLastNameFirst = (firstName, lastName) => {
  if (!firstName && !lastName) return null
  if (!firstName && lastName) return properCaseName(lastName)
  if (firstName && !lastName) return properCaseName(firstName)

  return `${properCaseName(lastName)}, ${properCaseName(firstName)}`
}

export const hasLength = (array) => array && array.length > 0

export const getNamesFromString = (string: string): string[] =>
  string &&
  string
    .split(', ')
    .reverse()
    .join(' ')
    .split(' ')
    .map((name) => properCaseName(name))

export const groupBy = (array, key) =>
  array &&
  array.reduce((acc, current) => {
    const group = current[key]

    return { ...acc, [group]: [...(acc[group] || []), current] }
  }, {})

export const times = (number) => (func) => {
  const iter = (index) => {
    if (index === number) return
    func(index)
    iter(index + 1)
  }
  return iter(0)
}

export const possessive = (string) => {
  if (!string) return ''

  return `${string}${string.toLowerCase().endsWith('s') ? '’' : '’s'}`
}

export const indefiniteArticle = (string) =>
  ['a', 'e', 'i', 'o', 'u'].some((vowel) => string.toLowerCase().startsWith(vowel)) ? 'an' : 'a'

export const formatLocation = (locationName) => {
  if (!locationName) return undefined
  if (locationName.includes('RECP')) return 'Reception'
  if (locationName.includes('CSWAP')) return 'No cell allocated'
  if (locationName.includes('COURT')) return 'Court'
  return locationName
}

export const isTemporaryLocation = (locationName) => {
  if (!locationName) return false
  if (locationName.endsWith('RECP')) return true
  if (locationName.endsWith('CSWAP')) return true
  if (locationName.endsWith('COURT')) return true
  if (locationName.endsWith('TAP')) return true
  return false
}

export const extractLocation = (location, agencyId) => {
  if (!location || !agencyId) return undefined
  const withoutAgency = stripAgencyPrefix(location, agencyId)
  return formatLocation(withoutAgency)
}

export const createStringFromList = (array) => {
  if (array.length > 1) {
    const lastItem = array.pop()
    return `${array.join(', ')} and ${lastItem}`
  }

  return array[0]
}

export const isXHRRequest = (req) =>
  req.xhr ||
  (req.headers.accept && (req.headers.accept.indexOf('json') > -1 || req.headers.accept.indexOf('image/*') > -1)) ||
  (req.path && req.path.endsWith('.js'))

export const joinUrlPath = (url, path) => {
  if (!url && !path) return url

  const endOfUrl = url[url.length - 1]
  const startOfPath = path[0]

  if (endOfUrl !== '/' && startOfPath !== '/') return `${url}/${path}`
  if (endOfUrl === '/' && startOfPath === '/') return url.substr(0, url.length - 1) + path

  return url + path
}

export const getWith404AsNull = async (apiCall) =>
  new Promise((resolve, reject) =>
    apiCall
      .then((details) => resolve(details))
      .catch((error) => {
        if (error?.response?.status === 404) resolve(null)
        reject(error)
      })
  )

export const stringWithAbbreviationsProcessor = (string) => {
  if (string === null) return null
  const matches = abbreviations.filter((abbr) => string.includes(abbr))
  const establishmentName = matches.reduce(
    (result, abbr) => result.replace(capitalizeUppercaseString(abbr), abbr.toUpperCase()),
    capitalizeUppercaseString(string)
  )
  return establishmentName
}

export default {
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
  stringWithAbbreviationsProcessor,
}
