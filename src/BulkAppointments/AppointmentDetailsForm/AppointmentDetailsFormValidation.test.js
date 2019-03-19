import moment from 'moment'
import { FORM_ERROR } from 'final-form'

import validateThenSubmit from './AppointmentDetailsFormValidation'

describe('Appointment form validation', () => {
  const findValidationError = (key, errors) => errors[FORM_ERROR].find(item => item.targetName === key)
  it('should return a message when the comment has exceeded 3600 characters', () => {
    const massiveComment = [...Array(3601).keys()].map(_ => 'A').join('')

    const validationMessages = validateThenSubmit(jest.fn)({
      comments: massiveComment,
    })

    const comments = findValidationError('comments', validationMessages)
    expect(comments.text).toBe('Maximum length should not exceed 3600 characters')
  })

  it('should not return validation messages for optional values', () => {
    const validationMessages = validateThenSubmit({
      onSuccess: () => {},
    })({
      date: moment('2019-10-19'),
      location: '1',
      appointmentType: 2,
      startTime: '2019-10-10:21:00:00Z',
    })

    expect(validationMessages).toBeUndefined()
  })

  it('should return error message when the start time in the past', () => {
    const validationMessages = validateThenSubmit(jest.fn)({
      date: moment(),
      startTime: moment().subtract(1, 'hours'),
    })

    const startTime = findValidationError('startTime', validationMessages)
    expect(startTime.text).toBe('The start time must not be in the past')
  })

  it('should return error message when the end time in the past', () => {
    const validationMessages = validateThenSubmit(jest.fn)({
      date: moment(),
      endTime: moment().subtract(1, 'hours'),
    })

    const startTime = findValidationError('endTime', validationMessages)
    expect(startTime.text).toBe('The end time must be in the future')
  })

  it('should return error messages when the start date is after the end date', () => {
    const validationMessages = validateThenSubmit(jest.fn)({
      startTime: '2019-01-01T21:00:00Z',
      endTime: '2019-01-01T20:00:00Z',
    })

    const startTime = findValidationError('startTime', validationMessages)
    const endTime = findValidationError('endTime', validationMessages)

    expect(startTime.text).toBe('The start time must be before the end time')
    expect(endTime.text).toBe('The end time must be after the start time')
  })

  it('should not allow the start and end time to be the same', () => {
    const date = moment('2019-01-01')
    const validationMessages = validateThenSubmit(jest.fn)({
      date,
      startTime: '2019-01-01T21:00:00Z',
      endTime: '2019-01-01T21:00:00Z',
    })

    const startTime = findValidationError('startTime', validationMessages)
    const endTime = findValidationError('endTime', validationMessages)

    expect(startTime.text).toBe('The start time must be before the end time')
    expect(endTime.text).toBe('The end time must be after the start time')
  })

  it('should return error messages when required fields are missing', () => {
    const validationMessages = validateThenSubmit({ onSuccess: jest.fn })({ recurring: true })

    const date = findValidationError('date', validationMessages)
    const location = findValidationError('location', validationMessages)
    const appointmentType = findValidationError('appointmentType', validationMessages)
    const repeats = findValidationError('repeats', validationMessages)
    const times = findValidationError('times', validationMessages)

    expect(date.text).toBe('Select date')
    expect(location.text).toBe('Select location')
    expect(appointmentType.text).toBe('Select appointment type')
    expect(repeats.text).toBe('Select a period')
    expect(times.text).toBe('Enter a number of times')
  })

  it('should call onSuccess with form values', done => {
    const date = moment('2019-01-01')

    const onSuccess = values => {
      expect(values).toEqual({
        appointmentType: 'ap1',
        location: 'loc1',
        date,
        startTime: '2019-01-01T21:00:00Z',
        endTime: '2019-01-01T22:00:00Z',
      })

      done()
    }

    const validationMessages = validateThenSubmit({ onSuccess })({
      date,
      startTime: '2019-01-01T21:00:00Z',
      endTime: '2019-01-01T22:00:00Z',
      appointmentType: 'ap1',
      location: 'loc1',
    })
    expect(validationMessages).toBeUndefined()
  })

  it('should return a error message when daily x times days exceeds 1 year', () => {
    const date = moment().endOf('day')
    const yearAndDay = moment()
      .endOf('day')
      .add('1', 'year')
      .add(2, 'days')

    const days = Math.abs(date.diff(yearAndDay, 'days', true))

    const validationMessages = validateThenSubmit({})({
      startTime: date,
      recurring: true,
      repeats: 'DAILY',
      times: days,
    })

    const timesValidationError = findValidationError('times', validationMessages)
    expect(timesValidationError.text).toBe('The number of times cannot exceed 1 year')
  })

  it('should return an error message when date is on a Saturday', () => {
    const date = moment().day('SATURDAY')

    const validationMessages = validateThenSubmit({})({
      date,
      recurring: true,
      repeats: 'WEEKDAYS',
    })

    const timesValidationError = findValidationError('date', validationMessages)
    expect(timesValidationError.text).toBe('The date must be a week day')
  })

  it('should return an error message when date is on a Sunday', () => {
    const date = moment().day('SUNDAY')

    const validationMessages = validateThenSubmit({})({
      date,
      recurring: true,
      repeats: 'WEEKDAYS',
    })

    const timesValidationError = findValidationError('date', validationMessages)
    expect(timesValidationError.text).toBe('The date must be a week day')
  })

  it('should return an error when weekdays x working days exceeds 1 year', () => {
    const date = moment('2019-01-01')

    const validationMessages = validateThenSubmit({})({
      startTime: date,
      recurring: true,
      repeats: 'WEEKDAYS',
      times: 367,
    })

    const timesValidationError = findValidationError('times', validationMessages)
    expect(timesValidationError.text).toBe('The number of times cannot exceed 1 year')
  })

  it('should NOT return error when weekdays x working days equals 1 year', () => {
    const date = moment('2019-01-01')

    const validationMessages = validateThenSubmit({})({
      startTime: date,
      recurring: true,
      repeats: 'WEEKDAYS',
      times: 261,
    })

    const timesValidationError = findValidationError('times', validationMessages)
    expect(timesValidationError).toBe(undefined)
  })
})
