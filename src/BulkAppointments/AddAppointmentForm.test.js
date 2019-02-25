import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'

import AddAppointmentForm, { FormFields, getInitalValues } from './AddAppointmentForm'
import { offenderStartTimeFieldName } from './AddAppointmentFormValidation'

import { DATE_TIME_FORMAT_SPEC, DATE_ONLY_FORMAT_SPEC, formatDateAndTime } from '../date-time-helpers'

describe('Add appointment form', () => {
  const stubFunc = () => {}
  const now = moment('2019-10-10T21:00:00')
  const startTime = '2019-10-10T22:00:00'

  const offenders = [
    { offenderNo: 'offenderNo1', bookingId: 1, firstName: 'firstName1', lastName: 'lastName1' },
    { offenderNo: 'offenderNo2', bookingId: 2, firstName: 'firstName2', lastName: 'lastName2', startTime: '21:00:00' },
  ]
  describe('Form', () => {
    const appointment = {
      startTime,
      locationId: 1,
      appointmentType: 'AC1',
      comments: 'test',
    }
    it('should render correctly', () => {
      const wrapper = shallow(
        <AddAppointmentForm
          onError={stubFunc}
          onSuccess={stubFunc}
          offenders={offenders}
          error="network error"
          date={startTime}
          now={now}
          startTime={startTime}
          appointment={appointment}
        />
      )
      expect(wrapper.dive()).toMatchSnapshot()
    })

    it('should pass correct props to all fields', () => {
      const wrapper = shallow(
        <FormFields
          offenders={offenders}
          now={now}
          date={startTime}
          errors={[
            { targetName: offenderStartTimeFieldName({ offenderNo: 'offenderNo1' }), text: 'Start test message' },
            { targetName: offenderStartTimeFieldName({ offenderNo: 'offenderNo2' }), text: 'Start test message' },
          ]}
        />
      )
      expect(wrapper).toMatchSnapshot()
    })
    it('should use start time from offenders or use the start time passed in', () => {
      const date = moment('2019-10-10').format(DATE_ONLY_FORMAT_SPEC)
      const optionalStartTime = moment('2000-10-10T22:10:00').format(DATE_TIME_FORMAT_SPEC)

      const values = getInitalValues({ offenders, date, startTime: optionalStartTime })
      expect(values).toEqual({
        'start-time-offenderNo1': optionalStartTime,
        'start-time-offenderNo2': formatDateAndTime({ date, time: '21:00:00' }),
      })
    })
  })
})
