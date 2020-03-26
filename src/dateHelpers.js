const moment = require('moment')

const DATE_TIME_FORMAT_SPEC = 'YYYY-MM-DDTHH:mm:ss'
const DATE_ONLY_FORMAT_SPEC = 'YYYY-MM-DD'
const DAY_MONTH_YEAR = 'DD/MM/YYYY'
const MOMENT_DAY_OF_THE_WEEK = 'dddd'

const DayOfTheWeek = dateTime => moment(dateTime, DATE_TIME_FORMAT_SPEC).format(MOMENT_DAY_OF_THE_WEEK)
const DayMonthYear = dateTime => moment(dateTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)
const Time = dateTime => moment(dateTime, DATE_TIME_FORMAT_SPEC).format('HH:mm')

const buildDateTime = ({ date, hours, minutes }) => {
  const time =
    date &&
    Number.isSafeInteger(Number.parseInt(hours, 10)) &&
    Number.isSafeInteger(Number.parseInt(minutes, 10)) &&
    moment(date, DAY_MONTH_YEAR)
  return time ? time.hour(Number(hours)).minutes(Number(minutes)) : ''
}

module.exports = {
  DATE_TIME_FORMAT_SPEC,
  DATE_ONLY_FORMAT_SPEC,
  DAY_MONTH_YEAR,
  MOMENT_DAY_OF_THE_WEEK,
  DayOfTheWeek,
  DayMonthYear,
  Time,
  buildDateTime,
}
