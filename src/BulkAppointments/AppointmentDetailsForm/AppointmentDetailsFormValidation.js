import moment from 'moment'
import { FORM_ERROR } from 'final-form'
import { DATE_TIME_FORMAT_SPEC } from '../../dateHelpers'
import RecurringAppointments from '../RecurringAppointments'

const validateThenSubmit = ({ onSuccess, appointmentTypes, locationTypes }) => values => {
  const formErrors = []
  const now = moment()
  const isToday = values.date ? values.date.isSame(now, 'day') : false

  if (values.comments && values.comments.length > 3600) {
    formErrors.push({ targetName: 'comments', text: 'Maximum length should not exceed 3600 characters' })
  }

  if (!values.appointmentType) {
    formErrors.push({ targetName: 'appointmentType', text: 'Select appointment type' })
  }

  if (!values.location) {
    formErrors.push({ targetName: 'location', text: 'Select location' })
  }

  if (!values.date) {
    formErrors.push({ targetName: 'date', text: 'Select date' })
  }

  if (!values.startTime) formErrors.push({ targetName: 'startTime', text: 'Select start time' })

  if (isToday && moment(values.startTime).isBefore(now)) {
    formErrors.push({ targetName: 'startTime', text: 'The start time must not be in the past' })
  }

  if (isToday && moment(values.endTime).isBefore(now)) {
    formErrors.push({ targetName: 'endTime', text: 'The end time must be in the future' })
  }

  if (values.startTime && values.endTime) {
    const endNotAfterStart = !moment(values.endTime, DATE_TIME_FORMAT_SPEC).isAfter(
      moment(values.startTime, DATE_TIME_FORMAT_SPEC),
      'minute'
    )

    if (endNotAfterStart) {
      formErrors.push({ targetName: 'startTime', text: 'The start time must be before the end time' })
      formErrors.push({ targetName: 'endTime', text: 'The end time must be after the start time' })
    }
  }

  if (values.recurring && !values.repeats) {
    formErrors.push({ targetName: 'repeats', text: 'Select a period' })
  }

  if (values.recurring && !values.times) {
    formErrors.push({ targetName: 'times', text: 'Enter a number of times' })
  }

  if (values.recurring && values.repeats && values.times && values.startTime) {
    const endOfPeriod = RecurringAppointments.calculateEndDate({
      startTime: values.startTime,
      repeats: values.repeats,
      numberOfTimes: values.times,
    })

    if (
      endOfPeriod &&
      endOfPeriod.isSameOrAfter(
        now
          .clone()
          .startOf('day')
          .add(1, 'years')
      )
    )
      formErrors.push({
        targetName: 'times',
        text: 'The number of times cannot exceed 1 year',
      })
  }

  if (values.recurring && values.repeats === 'WEEKDAYS') {
    const SATURDAY = 6
    const SUNDAY = 0
    if (moment(values.date).day() === SATURDAY || moment(values.date).day() === SUNDAY) {
      formErrors.push({
        targetName: 'date',
        text: 'The date must be a week day',
      })
    }
  }

  if (formErrors.length > 0) return { [FORM_ERROR]: formErrors }

  return onSuccess({ ...values, appointmentTypes, locationTypes })
}

export default validateThenSubmit
