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

const getHoursMinutes = timestamp => {
  const indexOfT = timestamp.indexOf('T')
  if (indexOfT < 0) {
    return ''
  }
  return timestamp.substr(indexOfT + 1, 5)
}

const isTodayOrAfter = date => {
  if (date === 'Today') {
    return true
  }
  const searchDate = moment(date, 'DD/MM/YYYY')
  return searchDate.isSameOrAfter(moment(), 'day')
}

const stripAgencyPrefix = (location, agency) => {
  const parts = location && location.split('-')
  if (parts && parts.length > 0) {
    const index = parts.findIndex(p => p === agency)
    if (index >= 0) {
      return location.substring(parts[index].length + 1, location.length)
    }
  }
  return location
}

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
  if (list.length < 40) return 'medium-list'
  return 'large-list'
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

module.exports = {
  properCase,
  properCaseName,
  getHoursMinutes,
  isTodayOrAfter,
  getMainEventDescription,
  getEventDescription,
  stripAgencyPrefix,
  getListSizeClass,
  getLongDateFormat,
  linkOnClick,
}
