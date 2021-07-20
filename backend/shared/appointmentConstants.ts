// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'DAY_MONTH_... Remove this comment to see the full error message
const { DAY_MONTH_YEAR } = require('../../common/dateHelpers')
const { calculateEndDate } = require('../../common/BulkAppointments/RecurringAppointments')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'repeatType... Remove this comment to see the full error message
const repeatTypes = [
  { value: 'WEEKLY', text: 'Weekly' },
  { value: 'DAILY', text: 'Daily' },
  { value: 'WEEKDAYS', text: 'Weekday (Monday to Friday)' },
  { value: 'MONTHLY', text: 'Monthly' },
  { value: 'FORTNIGHTLY', text: 'Fortnightly' },
]

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prepostDur... Remove this comment to see the full error message
const prepostDurations = {
  15: '15 minutes',
  30: '30 minutes',
  45: '45 minutes',
  60: '1 hour',
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'endRecurri... Remove this comment to see the full error message
const endRecurringEndingDate = ({ date, startTime, times, repeats }) => {
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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'validateDa... Remove this comment to see the full error message
const validateDate = (date, errors) => {
  const now = moment()
  if (!date) errors.push({ text: 'Select a date', href: '#date' })

  if (date && !moment(date, DAY_MONTH_YEAR, true).isValid())
    errors.push({ text: 'Enter a date in DD/MM/YYYY format', href: '#date' })

  if (date && moment(date, DAY_MONTH_YEAR).isBefore(now, 'day'))
    errors.push({ text: 'Select a date that is not in the past', href: '#date' })
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'validateSt... Remove this comment to see the full error message
const validateStartEndTime = (date, startTime, endTime, errors) => {
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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'validateCo... Remove this comment to see the full error message
const validateComments = (comments, errors) => {
  if (comments && comments.length > 3600)
    errors.push({ text: 'Maximum length should not exceed 3600 characters', href: '#comments' })
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getValidat... Remove this comment to see the full error message
const getValidationMessages = (fields, singleAppointment) => {
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

module.exports = {
  endRecurringEndingDate,
  validateDate,
  validateStartEndTime,
  validateComments,
  getValidationMessages,
  repeatTypes,
  prepostDurations,
}
