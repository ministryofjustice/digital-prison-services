const moment = require('moment')
const { DAY_MONTH_YEAR } = require('../../src/dateHelpers')
const { calculateEndDate, repeatTypes } = require('../../src/BulkAppointments/RecurringAppointments')

const endRecurringEndingDate = ({ date, startTime, times, repeats }) => {
  const recurringStartTime =
    (startTime && moment(startTime)) ||
    moment(date, DAY_MONTH_YEAR)
      .hours(0)
      .minutes(0)

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
  const now = moment()
  const isToday = date ? moment(date, DAY_MONTH_YEAR).isSame(now, 'day') : false

  if (!appointmentType) errors.push({ text: 'Select an appointment type', href: '#appointment-type' })

  if (!location) errors.push({ text: 'Select a location', href: '#location' })

  if (!date) errors.push({ text: 'Select a date', href: '#date' })

  if (date && !moment(date, DAY_MONTH_YEAR).isValid())
    errors.push({ text: 'Enter a date in DD/MM/YYYY format', href: '#date' })

  if (date && moment(date, DAY_MONTH_YEAR).isBefore(now, 'day'))
    errors.push({ text: 'Select a date that is not in the past', href: '#date' })

  if (sameTimeAppointments === 'yes' || singleAppointment) {
    const startTimeDuration = moment.duration(now.diff(startTime))
    const endTimeDuration = endTime && moment.duration(startTime.diff(endTime))

    if (!startTime) errors.push({ text: 'Select a start time', href: '#start-time-hours' })

    if (isToday && startTimeDuration.asMinutes() > 1)
      errors.push({ text: 'Select a start time that is not in the past', href: '#start-time-hours' })

    if (endTime && endTimeDuration.asMinutes() > 1) {
      errors.push({ text: 'Select an end time that is not in the past', href: '#end-time-hours' })
    }
  }

  // Video link appointments require an end time so we can show availability
  if (appointmentType === 'VLB' && !endTime) errors.push({ text: 'Select an end time', href: '#end-time-hours' })

  if (comments && comments.length > 3600)
    errors.push({ text: 'Maximum length should not exceed 3600 characters', href: '#comments' })

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
  getValidationMessages,
  repeatTypes,
}
