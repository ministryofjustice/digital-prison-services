import moment from 'moment'

export const DATE_TIME_FORMAT_SPEC = 'YYYY-MM-DDTHH:mm:ss'
export const DATE_ONLY_FORMAT_SPEC = 'YYYY-MM-DD'
export const DAY_MONTH_YEAR = 'DD/MM/YYYY'
export const MOMENT_DAY_OF_THE_WEEK = 'dddd'

export const DayOfTheWeek = dateTime => moment(dateTime, DATE_TIME_FORMAT_SPEC).format(MOMENT_DAY_OF_THE_WEEK)
export const DayMonthYear = dateTime => moment(dateTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)
export const Time = dateTime => moment(dateTime, DATE_TIME_FORMAT_SPEC).format('HH:mm')
