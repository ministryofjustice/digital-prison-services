import { FORM_ERROR } from 'final-form'
import { validateThenSubmit } from './AddPrisonerValidation'

describe('Add appointment form validation', () => {
  const stubFunc = () => {}
  const startTime = '2019-10-10T22:00:00'

  const offenders = [
    { offenderNo: 'offenderNo1', bookingId: 1, firstName: 'firstName1', lastName: 'lastName1' },
    { offenderNo: 'offenderNo2', bookingId: 2, firstName: 'firstName2', lastName: 'lastName2', startTime: '21:00:00' },
  ]
  it('should return validation messages for offender start times', () => {
    const onSubmit = jest.fn()
    const validator = validateThenSubmit({ offenders, onSubmitAppointment: onSubmit })
    const validationMessages = validator({
      'start-time-offenderNo2': startTime,
    })[FORM_ERROR]

    expect(validationMessages).toEqual([
      {
        targetName: 'start-time-offenderNo1',
        text: 'Select a start time',
      },
    ])

    expect(onSubmit).toHaveBeenCalledTimes(0)
  })

  it('should call onSubmit with the values when there are no validation error', done => {
    const onSubmit = values => {
      expect(values).toEqual([{ bookingId: 1, startTime }, { bookingId: 2, startTime }])
      done()
    }
    const validator = validateThenSubmit({ offenders, onSubmitAppointment: onSubmit })
    const validationMessages = validator({
      'start-time-offenderNo1': startTime,
      'start-time-offenderNo2': startTime,
    })
    expect(validationMessages).toBeUndefined()
  })

  it('should return validation messages where minutes are not increments of five starting from zero', () => {
    const validator = validateThenSubmit({
      offenders: [
        {
          offenderNo: 'offenderNo2',
          bookingId: 2,
          firstName: 'firstName2',
          lastName: 'lastName2',
        },
      ],
      onSubmitAppintment: stubFunc,
    })
    const validationMessages = validator({
      'start-time-offenderNo2': '2019-10-10T21:22:00',
    })
    expect(validationMessages[FORM_ERROR]).toEqual([
      {
        targetName: 'start-time-offenderNo2',
        text: 'Minutes must be increments of five',
      },
    ])
  })

  it('should return validation errors when the end time is before the start time for each offender row', () => {
    const validator = validateThenSubmit({
      endTime: '2019-10-10T01:20:00',
      offenders: [
        {
          offenderNo: 'offenderNo2',
          bookingId: 2,
          firstName: 'firstName2',
          lastName: 'lastName2',
        },
      ],
      onSubmitAppointment: stubFunc,
    })
    const validationMessages = validator({
      'start-time-offenderNo2': '2019-10-10T21:20:00',
    })
    expect(validationMessages[FORM_ERROR]).toEqual([
      {
        targetName: 'start-time-offenderNo2',
        text: 'The start time must be before the end time',
      },
    ])
  })
})
