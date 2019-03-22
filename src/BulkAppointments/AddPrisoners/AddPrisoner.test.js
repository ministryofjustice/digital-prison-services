import React from 'react'
import testRenderer from 'react-test-renderer'
import moment from 'moment'

import { Form } from 'react-final-form'
import AddAppointmentForm, { FormFields, getInitialValues, interceptOnChange } from './AddPrisoners'
import { offenderStartTimeFieldName } from './AddPrisonerValidation'

import { DATE_TIME_FORMAT_SPEC, DATE_ONLY_FORMAT_SPEC } from '../../dateHelpers'

describe('Add appointment form', () => {
  const stubFunc = () => {}
  const now = moment('2019-10-10T21:00:00Z')
  const startTime = '2019-10-10T22:00:00Z'

  const offenders = [
    { offenderNo: 'offenderNo1', bookingId: 1, firstName: 'firstName1', lastName: 'lastName1' },
    { offenderNo: 'offenderNo2', bookingId: 2, firstName: 'firstName2', lastName: 'lastName2' },
  ]
  describe('Form', () => {
    const appointment = {
      startTime,
      locationId: 1,
      appointmentType: 'AC1',
      comments: 'test',
    }
    it('should render correctly', () => {
      const tree = testRenderer
        .create(
          <AddAppointmentForm
            onError={stubFunc}
            onSuccess={stubFunc}
            offenders={offenders}
            error="network error"
            date={startTime}
            now={now}
            startTime={startTime}
            appointment={appointment}
            resetErrors={stubFunc}
            onCancel={() => {}}
            dispatchAppointmentPrisoners={() => {}}
          />
        )
        .toJSON()

      expect(tree).toMatchSnapshot()
    })

    it('should pass correct props to all fields', () => {
      const tree = testRenderer
        .create(
          <Form
            onSubmit={() => {}}
            render={() => (
              <FormFields
                dispatchAppointmentPrisoners={() => {}}
                offenders={offenders}
                now={now}
                date={startTime}
                errors={[
                  {
                    targetName: offenderStartTimeFieldName({ offenderNo: 'offenderNo1' }),
                    text: 'Start test message',
                  },
                  {
                    targetName: offenderStartTimeFieldName({ offenderNo: 'offenderNo2' }),
                    text: 'Start test message',
                  },
                ]}
              />
            )}
          />
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
    it('should set the offender start time to the from past in', () => {
      const date = moment('2019-10-10').format(DATE_ONLY_FORMAT_SPEC)
      const preSelectedStartTime = moment('2000-10-10T22:10:00Z').format(DATE_TIME_FORMAT_SPEC)

      const values = getInitialValues({ offenders, date, startTime: preSelectedStartTime })
      expect(values).toEqual({
        'start-time-offenderNo1': preSelectedStartTime,
        'start-time-offenderNo2': preSelectedStartTime,
      })
    })

    it('should use start time from offenders or use the start time passed in', () => {
      const date = moment('2019-10-10').format(DATE_ONLY_FORMAT_SPEC)
      const originalStartTime = '2000-10-10T22:10:00:00Z'
      const newStartTime = '2019-10-10T21:00:00Z'
      const offendersWithStartTime = [offenders[0], { ...offenders[1], startTime: newStartTime }]

      const values = getInitialValues({ offenders: offendersWithStartTime, date, startTime: originalStartTime })
      expect(values).toEqual({
        'start-time-offenderNo1': originalStartTime,
        'start-time-offenderNo2': newStartTime,
      })
    })

    it('should trigger dispatchAppointmentPrisoners with newly entered offender start times and continue to bubble changes back up to final form', () => {
      const input = {
        onChange: jest.fn(),
      }
      const dispatchAppointmentPrisoners = jest.fn()
      interceptOnChange({ input, dispatchAppointmentPrisoners, currentOffender: offenders[0], offenders })(startTime)

      expect(input.onChange).toHaveBeenCalledWith(startTime)
      expect(dispatchAppointmentPrisoners).toHaveBeenCalledWith([
        {
          bookingId: 1,
          firstName: 'firstName1',
          lastName: 'lastName1',
          offenderNo: 'offenderNo1',
          startTime: '2019-10-10T22:00:00Z',
        },
        { bookingId: 2, firstName: 'firstName2', lastName: 'lastName2', offenderNo: 'offenderNo2' },
      ])
    })
  })
})
