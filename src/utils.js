const moment = require('moment')

const properCase = word =>
  typeof word === 'string' && word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

function isBlank(str) {
  return !str || /^\s*$/.test(str)
}
const removeBlanks = array => array.filter(item => !!item)

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
        .map(properCase)
        .join('-')

const forenameToInitial = name => {
  if (!name) return null
  return `${name.charAt()} ${name.split(' ').pop()}`
}

const getHoursMinutes = timestamp => {
  const indexOfT = timestamp.indexOf('T')
  if (indexOfT < 0) {
    return ''
  }
  return timestamp.substr(indexOfT + 1, 5)
}

const isToday = date => {
  if (date === 'Today') return true

  return moment(date, 'DD/MM/YYYY')
    .startOf('day')
    .isSame(moment().startOf('day'))
}
const getCurrentPeriod = date => {
  const afternoonSplit = 12
  const eveningSplit = 17
  const currentHour = moment(date).format('H')

  if (currentHour < afternoonSplit) return 'AM'
  if (currentHour < eveningSplit) return 'PM'
  return 'ED'
}

const isTodayOrAfter = date => {
  if (isToday(date)) return true

  const searchDate = moment(date, 'DD/MM/YYYY')
  return searchDate.isSameOrAfter(moment(), 'day')
}

const isAfterToday = date => {
  const dayAfter = moment().add(1, 'day')
  const daysDifference = moment(date, 'DD/MM/YYYY').diff(dayAfter, 'day')
  return daysDifference >= 0
}

const isWithinNextTwoWorkingDays = date => {
  if (isToday(date)) return true
  if (moment(date, 'DD/MM/YYYY').isBefore(moment().startOf('day'))) return false

  let daysInAdvance = 2
  const currentDay = moment().isoWeekday()
  const isThursday = currentDay === 4
  const isFriday = currentDay === 5
  const isSaturday = currentDay === 6

  if (isThursday || isFriday) daysInAdvance += 2
  if (isSaturday) daysInAdvance += 1

  return moment(date, 'DD/MM/YYYY').isBefore(
    moment()
      .add(daysInAdvance, 'days')
      .endOf('day')
  )
}

const isWithinLastYear = date => {
  if (isToday(date)) return true

  const oneYearAgo = moment().subtract(1, 'years')
  const daysDifference = moment(date, 'DD/MM/YYYY').diff(oneYearAgo, 'day')

  return daysDifference >= 0
}

const isWithinLastWeek = date => {
  if (isToday(date)) return true

  const oneWeekAgo = moment().subtract(1, 'week')
  const daysDifference = moment(date, 'DD/MM/YYYY').diff(oneWeekAgo, 'day')
  return daysDifference >= 0
}

const isBeforeToday = date => !(isToday(date) || isAfterToday(date))

const getMainEventDescription = event => {
  if (event.eventType === 'PRISON_ACT' || event.event === 'PA') {
    return event.comment
  }
  return removeBlanks([event.eventDescription, event.comment]).join(' - ')
}

const getEventDescription = event => {
  if (event.eventType === 'PRISON_ACT' || event.event === 'PA') {
    return event.comment
  }
  return removeBlanks([event.eventDescription, event.eventLocation, event.comment]).join(' - ')
}

const getListSizeClass = list => {
  if (!list || list.length === 0) return 'empty-list'
  if (list.length < 20) return 'small-list'
  if (list.length < 30) return 'medium-list'
  if (list.length < 40) return 'large-list'
  return 'extra-large-list'
}

const getLongDateFormat = date => {
  if (date && date !== 'Today') return moment(date, 'DD/MM/YYYY').format('dddd Do MMMM')
  return moment().format('dddd Do MMMM')
}

const linkOnClick = handlerFn => ({
  tabIndex: 0,
  role: 'link',
  onClick: handlerFn,
  onKeyDown: event => {
    if (event.key === 'Enter') handlerFn(event)
  },
})

const pascalToString = value =>
  value.substring(0, 1) +
  value
    .substring(1)
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()

module.exports = {
  properCase,
  properCaseName,
  forenameToInitial,
  getHoursMinutes,
  isTodayOrAfter,
  getCurrentPeriod,
  isAfterToday,
  isWithinLastYear,
  isWithinLastWeek,
  isBeforeToday,
  getMainEventDescription,
  getEventDescription,
  getListSizeClass,
  getLongDateFormat,
  linkOnClick,
  pascalToString,
  isWithinNextTwoWorkingDays,
}
