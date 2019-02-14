import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'

import { FORM_ERROR } from 'final-form'

import Appointments, { FormFields, onSubmit } from './AppointmentForm'

describe('Appointment form', () => {
  describe('Form', () => {
    it('should render correctly', () => {
      const outer = shallow(<Appointments trySubmit={jest.fn()} now={moment('2019-01-01T21:00:00')} />)
      expect(outer).toMatchSnapshot()

      const container = outer.dive()
      expect(container).toMatchSnapshot()
    })

    it('should pass correct props to all fields', () => {
      const wrapper = shallow(
        <FormFields
          values={{ date: '2019-01-01T21:00:00' }}
          now={moment('2019-01-01T21:00:00')}
          appointmentTypes={[{ id: '1', description: 'app1' }]}
          locationTypes={[{ id: 1, description: 'loc1' }]}
          errors={[
            { targetName: 'date', text: 'Date test message' },
            { targetName: 'startTime', text: 'Start test message' },
            { targetName: 'endTime', text: 'End time test message' },
            { targetName: 'comments', text: 'Date test message' },
            { targetName: 'appointmentType', text: 'appointment type test message' },
            { targetName: 'locationType', text: 'location type test message' },
          ]}
        />
      )

      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('Form validation', () => {
    const findValidationError = (key, errors) => errors[FORM_ERROR].find(item => item.targetName === key)
    it('should return a message when the comment has exceeded 3600 charactors', () => {
      const massiveComment = [...Array(3601).keys()].map(_ => 'A').join('')

      const validationMessages = onSubmit(jest.fn)({
        comments: massiveComment,
      })

      const comments = findValidationError('comments', validationMessages)
      expect(comments.text).toBe('Maximum length should not exceed 3600 characters')
    })

    it('should return error message when the start time in the past', () => {
      const validationMessages = onSubmit(jest.fn)({
        date: moment(),
        startTime: moment().subtract(1, 'hours'),
      })

      const startTime = findValidationError('startTime', validationMessages)
      expect(startTime.text).toBe("Start time shouldn't be in the past")
    })

    it('should return error message when the end time in the past', () => {
      const validationMessages = onSubmit(jest.fn)({
        date: moment(),
        endTime: moment().subtract(1, 'hours'),
      })

      const startTime = findValidationError('endTime', validationMessages)
      expect(startTime.text).toBe("End time shouldn't be in the past")
    })

    it('should return error messages whent the start date is after the end date', () => {
      const validationMessages = onSubmit(jest.fn)({
        startTime: '2019-01-01T21:00:00',
        endTime: '2019-01-01T20:00:00',
      })

      const startTime = findValidationError('startTime', validationMessages)
      const endTime = findValidationError('endTime', validationMessages)

      expect(startTime.text).toBe("Start time should't be after End time")
      expect(endTime.text).toBe("End time shouldn't be before Start time")
    })

    it('should return a message when required fields are missing', () => {
      const validationMessages = onSubmit(jest.fn)({})

      const date = findValidationError('date', validationMessages)
      const location = findValidationError('location', validationMessages)
      const applicationType = findValidationError('appointmentType', validationMessages)

      expect(date.text).toBe('Date is required')
      expect(location.text).toBe('Location is required')
      expect(applicationType.text).toBe('Appointment type is required')
    })

    it('should call onSucess with form values', () => {
      const today = moment()
      const onSuccess = jest.fn()

      const validationErrors = onSubmit(onSuccess)({
        date: today,
        startTime: today,
        endTime: today,
        appointmentType: 'ap1',
        location: 'loc1',
      })

      expect(onSuccess).toHaveBeenCalledWith({
        appointmentType: 'ap1',
        date: today,
        endTime: today,
        location: 'loc1',
        startTime: today,
      })
      expect(validationErrors).toBeUndefined()
    })
  })
})
