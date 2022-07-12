import moment from 'moment'
import { DAY_MONTH_YEAR } from '../../common/dateHelpers'
import { calculateEndDate } from '../../common/BulkAppointments/RecurringAppointments'

export const repeatTypes = [
  { value: 'WEEKLY', text: 'Weekly' },
  { value: 'DAILY', text: 'Daily' },
  { value: 'WEEKDAYS', text: 'Weekday (Monday to Friday)' },
  { value: 'MONTHLY', text: 'Monthly' },
  { value: 'FORTNIGHTLY', text: 'Fortnightly' },
]

export const prepostDurations = {
  15: '15 minutes',
  30: '30 minutes',
  45: '45 minutes',
  60: '1 hour',
}

export const endRecurringEndingDate = ({
  date,
  startTime,
  times,
  repeats,
}: {
  date: string
  startTime?: string
  times: string
  repeats: string
}): Record<any, any> => {
  const recurringStartTime = (startTime && moment(startTime)) || moment(date, DAY_MONTH_YEAR).hours(0).minutes(0)

  const endOfPeriod = calculateEndDate({
    startTime: recurringStartTime,
    repeats,
    numberOfTimes: times,
  })

  return {
    endOfPeriod,
    recurringStartTime,
  }
}

export const validateDate = (date, errors) => {
  const now = moment()
  if (!date) errors.push({ text: 'Select a date', href: '#date' })

  if (date && !moment(date, DAY_MONTH_YEAR, true).isValid())
    errors.push({ text: 'Enter a date in DD/MM/YYYY format', href: '#date' })

  if (date && moment(date, DAY_MONTH_YEAR).isBefore(now, 'day'))
    errors.push({ text: 'Select a date that is not in the past', href: '#date' })
}

export const validateStartEndTime = (date, startTime, endTime, errors) => {
  const now = moment()
  const isToday = date ? moment(date, DAY_MONTH_YEAR).isSame(now, 'day') : false
  const startTimeDuration = moment.duration(now.diff(startTime))
  const endTimeDuration = endTime && moment.duration(startTime.diff(endTime))

  if (!startTime) errors.push({ text: 'Select a start time', href: '#start-time-hours' })

  if (isToday && startTimeDuration.asMinutes() > 1)
    errors.push({ text: 'Select a start time that is not in the past', href: '#start-time-hours' })

  if (endTime && endTimeDuration.asMinutes() > 1) {
    errors.push({ text: 'Select an end time that is not in the past', href: '#end-time-hours' })
  }
}

export const validateComments = (comments, errors) => {
  if (comments && comments.length > 3600)
    errors.push({ text: 'Maximum length should not exceed 3600 characters', href: '#comments' })
}

export const getValidationMessages = (fields, singleAppointment?) => {
  const {
    appointmentType,
    location,
    date,
    startTime,
    endTime,
    comments,
    recurring,
    repeats,
    times,
    sameTimeAppointments,
  } = fields
  const errors = []

  if (!appointmentType) errors.push({ text: 'Select an appointment type', href: '#appointment-type' })

  if (!location) errors.push({ text: 'Select a location', href: '#location' })

  validateDate(date, errors)

  if (sameTimeAppointments === 'yes' || singleAppointment) {
    validateStartEndTime(date, startTime, endTime, errors)
  }

  // Video link appointments require an end time so we can show availability
  if (appointmentType === 'VLB' && !endTime) errors.push({ text: 'Select an end time', href: '#end-time-hours' })

  validateComments(comments, errors)

  if (!recurring) {
    const recurringErrorMessage = singleAppointment
      ? 'this is a recurring appointment'
      : 'these are recurring appointments'
    errors.push({ href: '#recurring', text: `Select yes if ${recurringErrorMessage}` })
  }

  if (recurring === 'yes' && !repeats) errors.push({ href: '#repeats', text: 'Select a period' })

  if (recurring === 'yes') {
    if (Number(times) <= 0 || !Number(times))
      errors.push({ href: '#times', text: 'Enter the number of appointments using numbers only' })

    if (repeats && times) {
      const { recurringStartTime, endOfPeriod } = endRecurringEndingDate({ date, startTime, repeats, times })

      if (endOfPeriod && endOfPeriod.isSameOrAfter(recurringStartTime.startOf('day').add(1, 'years'))) {
        errors.push({
          href: '#times',
          text: 'Select fewer number of appointments - you can only add them for a maximum of 1 year',
        })
      }
    }

    if (repeats === 'WEEKDAYS') {
      const SATURDAY = 6
      const SUNDAY = 0
      if (moment(date, DAY_MONTH_YEAR).day() === SATURDAY || moment(date, DAY_MONTH_YEAR).day() === SUNDAY) {
        errors.push({
          href: '#date',
          text: 'The date must be a week day',
        })
      }
    }
  }

  return errors
}

export default {
  endRecurringEndingDate,
  validateDate,
  validateStartEndTime,
  validateComments,
  getValidationMessages,
  repeatTypes,
  prepostDurations,
}
