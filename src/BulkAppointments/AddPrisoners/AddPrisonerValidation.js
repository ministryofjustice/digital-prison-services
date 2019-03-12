import moment from 'moment'
import { FORM_ERROR } from 'final-form'
import { isValidMinutes } from '../../Components/TimePicker/TimePicker'
import { DATE_TIME_FORMAT_SPEC } from '../../date-formats'

export const offenderStartTimeFieldName = ({ offenderNo }) => `start-time-${offenderNo}`

const hasValue = value => Boolean(value)
const startTimesMustHaveAValue = ({ offenders, values }) =>
  offenders
    .map(offender => offenderStartTimeFieldName({ offenderNo: offender.offenderNo }))
    .filter(name => !values[name])
    .map(name => ({
      targetName: name,
      text: 'Select a start time',
    }))

const startTimeMinutesMustBeIncrementsOfFive = ({ values }) =>
  Object.keys(values)
    .map(key => {
      const startTime = values[key]
      if (!startTime) return null

      const minutes = moment(startTime).minutes()
      const error = isValidMinutes(minutes) === false
      const validationError = { targetName: key, text: 'Minutes must be increments of five' }

      return error ? validationError : null
    })
    .filter(error => hasValue(error))

const endTimesMustBeAfterStartTimes = ({ offenders, values, endTime }) => {
  if (!endTime) return []

  const startTimes = offenders.map(offender => ({
    offenderNo: offender.offenderNo,
    startTime: values[offenderStartTimeFieldName({ offenderNo: offender.offenderNo })],
  }))

  return startTimes
    .filter(
      startTimeInfo =>
        !moment(endTime, DATE_TIME_FORMAT_SPEC).isAfter(
          moment(startTimeInfo.startTime, DATE_TIME_FORMAT_SPEC),
          'minute'
        )
    )
    .map(startTimeInfo => ({
      targetName: offenderStartTimeFieldName({ offenderNo: startTimeInfo.offenderNo }),
      text: 'The start time must be before the end time',
    }))
}

export const validateThenSubmit = ({ offenders, endTime, onSubmitAppointment }) => values => {
  const formErrors = [
    ...Array.from(startTimesMustHaveAValue({ offenders, values })),
    ...Array.from(startTimeMinutesMustBeIncrementsOfFive({ values })),
    ...Array.from(endTimesMustBeAfterStartTimes({ offenders, values, endTime })),
  ]

  if (formErrors.filter(error => hasValue(error)).length > 0) {
    return {
      [FORM_ERROR]: formErrors,
    }
  }
  const offendersWithStartTime = offenders.map(offender => ({
    bookingId: offender.bookingId,
    startTime: values[offenderStartTimeFieldName({ offenderNo: offender.offenderNo })],
  }))

  return onSubmitAppointment(offendersWithStartTime)
}
