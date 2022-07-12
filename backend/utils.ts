import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../common/dateHelpers'
import abbreviations from '../common/abbreviations'

export const switchDateFormat = (displayDate: moment.MomentInput, fromFormat = 'DD/MM/YYYY'): moment.MomentInput => {
  if (displayDate) {
    return moment(displayDate, fromFormat).format('YYYY-MM-DD')
  }

  return displayDate
}

export const readableDateFormat = (displayDate: moment.MomentInput, fromFormat = 'DD/MM/YYYY'): moment.MomentInput => {
  if (displayDate) {
    return moment(displayDate, fromFormat).format('D MMMM YYYY')
  }
  return displayDate
}

export const formatTimestampToDate = (timestamp: moment.MomentInput, outputFormat = 'DD/MM/YYYY'): moment.MomentInput =>
  timestamp && moment(timestamp).format(outputFormat)

export const formatTimestampToDateTime = (
  timestamp: moment.MomentInput,
  format = 'DD/MM/YYYY - HH:mm'
): moment.MomentInput => timestamp && moment(timestamp).format(format)

export const distinct = (data: never[]): unknown =>
  data.reduce(
    (accumulator: unknown[], current: unknown) =>
      accumulator.includes(current) ? accumulator : [...accumulator, current],
    []
  )

export const sortByDateTime = (t1: moment.MomentInput, t2: moment.MomentInput): number => {
  if (t1 && t2) return moment(t1).valueOf() - moment(t2).valueOf()
  if (t1) return -1
  if (t2) return 1
  return 0
}

export const compareStrings = (l: string, r: string): number => l.localeCompare(r, 'en', { ignorePunctuation: true })

export const compareNumbers = (l: number, r: number): number => {
  if (!Number.isFinite(l) && !Number.isFinite(r)) return 0
  if (!Number.isFinite(l)) return 1
  if (!Number.isFinite(r)) return -1
  return l - r
}

export const capitalize = (string: string): string => {
  if (typeof string !== 'string') return ''
  const lowerCase = string.toLowerCase()
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1)
}

export const capitalizeStart = (string: string): string =>
  string && string[0].toUpperCase() + string.slice(1, string.length)

export const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
export const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(capitalize).join('-'))

export const formatName = (firstName: string, lastName: string): string =>
  [properCaseName(firstName), properCaseName(lastName)].filter(Boolean).join(' ')

export const isViewableFlag = (code: string): boolean =>
  ['HA', 'XEL', 'PEEP', 'RNO121', 'RCON', 'RCDR', 'URCU', 'UPIU', 'USU', 'URS'].includes(code)

export const arrayToQueryString = (array: string[] | number[] | boolean[], key: string): string =>
  array && array.map((item) => `${key}=${encodeURIComponent(item)}`).join('&')

export const mapToQueryString = (params: Record<never, never>): string =>
  Object.keys(params)
    .filter((key) => params[key])
    .map((key) => {
      if (Array.isArray(params[key])) return arrayToQueryString(params[key], key)
      return `${key}=${encodeURIComponent(params[key])}`
    })
    .join('&')

export const toMap = (key: string, array: never[]): Map<unknown, unknown> =>
  array.reduce((map, current) => {
    if (map.has(current[key]) === false) {
      map.set(current[key], current)
    }
    return map
  }, new Map())

const formatValue = (quantity: number, label: string) => {
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
export const formatDaysInYears = (days: number): string => {
  const years = Math.floor(days / 365)
  const remainingDays = days % 365
  const yearString = formatValue(years, 'year')
  const joinString = years > 0 && remainingDays > 0 ? ', ' : ''
  const dayString = formatValue(remainingDays, 'day')
  return `${yearString}${joinString}${dayString}`
}

export const formatMonthsAndDays = (months: number, days: number): string => {
  const monthString = formatValue(months, 'month')
  const joinString = months > 0 && days > 0 ? ', ' : ''
  const dayString = formatValue(days, 'day')
  return `${monthString}${joinString}${dayString}`
}

export const pascalToString = (value: string): string =>
  value &&
  value.substring(0, 1) +
    value
      .substring(1)
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()

export const merge = (left: Record<string, unknown>, right: Record<string, unknown>): Record<string, unknown> => ({
  ...left,
  ...right,
})

export const isToday = (date: moment.MomentInput): boolean => {
  if (date === 'Today') return true

  return moment(date, 'DD/MM/YYYY').startOf('day').isSame(moment().startOf('day'))
}

export const isTodayOrAfter = (date: moment.MomentInput): boolean => {
  if (isToday(date)) return true

  const searchDate = moment(date, 'DD/MM/YYYY')
  return searchDate.isSameOrAfter(moment(), 'day')
}

export const getCurrentPeriod = (date: moment.MomentInput): string => {
  const afternoonSplit = 12
  const eveningSplit = 17
  const currentHour = parseInt(moment(date).format('H'), 10)

  if (currentHour < afternoonSplit) return 'AM'
  if (currentHour < eveningSplit) return 'PM'
  return 'ED'
}

const isValidDateTimeFormat = (dateTimeString: moment.MomentInput) =>
  moment(dateTimeString, DATE_TIME_FORMAT_SPEC, true).isValid()

export const getDate = (dateTimeString: string, format = 'dddd D MMMM YYYY'): string => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format(format)
}

export const getTime = (dateTimeString: string): string => {
  if (!isValidDateTimeFormat(dateTimeString)) return 'Invalid date or time'

  return moment(dateTimeString, DATE_TIME_FORMAT_SPEC).format('HH:mm')
}

export const forenameToInitial = (name: { charAt: () => unknown; split: (arg0: string) => unknown[] }): string => {
  if (!name) return null
  return `${name.charAt()}. ${name.split(' ').pop()}`
}

export const stripAgencyPrefix = (location: string, agency: string): string => {
  const parts = location && location.split('-')
  if (parts && parts.length > 0) {
    const index = parts.findIndex((p) => p === agency)
    if (index >= 0) {
      return location.substring(parts[index].length + 1, location.length)
    }
  }

  return null
}

export const chunkArray = (arr: unknown[], size: number): unknown[] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size))

// anything with a number is considered not to be a name, so therefore an identifier (prison no, PNC no etc.)
export const isPrisonerIdentifier = (string: string): boolean => /\d/.test(string)

export const isAfterToday = (date: moment.MomentInput): boolean => {
  const dayAfter = moment().add(1, 'day')
  const daysDifference = moment(date).diff(dayAfter, 'day')
  return daysDifference >= 0
}

export const isBeforeToday = (date: moment.MomentInput): boolean => !(isToday(date) || isAfterToday(date))

export const hyphenatedStringToCamel = (string: string): string =>
  string.replace(/[-\s]([a-z])/g, (char) => char[1].toUpperCase())

export const formatCurrency = (number: number, currency: string): string =>
  typeof number === 'number' ? number.toLocaleString('en-GB', { style: 'currency', currency: currency || 'GBP' }) : ''

export const capitalizeUppercaseString = (string: string): string => {
  if (!string) return null
  return string
    .replace('(', '( ')
    .split(' ')
    .map((name) => capitalize(name))
    .join(' ')
    .replace('( ', '(')
}

export const putLastNameFirst = (firstName: string, lastName: string): string => {
  if (!firstName && !lastName) return null
  if (!firstName && lastName) return properCaseName(lastName)
  if (firstName && !lastName) return properCaseName(firstName)

  return `${properCaseName(lastName)}, ${properCaseName(firstName)}`
}

export const hasLength = (array: unknown[]): boolean => array && array.length > 0

export const getNamesFromString = (string: string): string[] =>
  string &&
  string
    .split(', ')
    .reverse()
    .join(' ')
    .split(' ')
    .map((name) => properCaseName(name))

export const groupBy = (array: never[], key: string): Record<string, unknown> =>
  array &&
  array.reduce((acc, current) => {
    const group = current[key]

    return { ...acc, [group]: [...(acc[group] || []), current] }
  }, {})

export const times =
  (number: number) =>
  (func: (index: unknown) => unknown): void => {
    const iter = (index: number) => {
      if (index === number) return
      func(index)
      iter(index + 1)
    }
    return iter(0)
  }

export const possessive = (string: string): string => {
  if (!string) return ''

  return `${string}${string.toLowerCase().endsWith('s') ? '’' : '’s'}`
}

export const indefiniteArticle = (string: string): string =>
  ['a', 'e', 'i', 'o', 'u'].some((vowel) => string.toLowerCase().startsWith(vowel)) ? 'an' : 'a'

export const formatLocation = (locationName: string): string => {
  if (!locationName) return undefined
  if (locationName.includes('RECP')) return 'Reception'
  if (locationName.includes('CSWAP')) return 'No cell allocated'
  if (locationName.includes('COURT')) return 'Court'
  return locationName
}

export const isTemporaryLocation = (locationName: string): boolean => {
  if (!locationName) return false
  if (locationName.endsWith('RECP')) return true
  if (locationName.endsWith('CSWAP')) return true
  if (locationName.endsWith('COURT')) return true
  if (locationName.endsWith('TAP')) return true
  return false
}

export const extractLocation = (location: string, agencyId: string): string => {
  if (!location || !agencyId) return undefined
  const withoutAgency = stripAgencyPrefix(location, agencyId)
  return formatLocation(withoutAgency)
}

export const createStringFromList = (array: unknown[]): unknown => {
  if (array.length > 1) {
    const lastItem = array.pop()
    return `${array.join(', ')} and ${lastItem}`
  }

  return array[0]
}

export const isXHRRequest = (req: { xhr: never; headers: { accept: string | string[] }; path: string }): boolean =>
  req.xhr ||
  (req.headers.accept && (req.headers.accept.indexOf('json') > -1 || req.headers.accept.indexOf('image/*') > -1)) ||
  (req.path && req.path.endsWith('.js'))

export const joinUrlPath = (url: string, path: string): string => {
  if (!url && !path) return url

  const endOfUrl = url[url.length - 1]
  const startOfPath = path[0]

  if (endOfUrl !== '/' && startOfPath !== '/') return `${url}/${path}`
  if (endOfUrl === '/' && startOfPath === '/') return url.substr(0, url.length - 1) + path

  return url + path
}

export const getWith404AsNull = async (apiCall: Promise<any>): Promise<never> =>
  new Promise((resolve, reject) =>
    apiCall
      .then((details) => resolve(details))
      .catch((error) => {
        if (error?.response?.status === 404) resolve(null)
        reject(error)
      })
  )

export const stringWithAbbreviationsProcessor = (string: string): string => {
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
