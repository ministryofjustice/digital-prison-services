import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'

import AppointmentDetailsForm, { FormFields } from './AppointmentDetailsForm'

describe('Appointment form', () => {
  it('should render correctly', () => {
    const outer = shallow(
      <AppointmentDetailsForm
        onCancel={jest.fn()}
        onSuccess={jest.fn()}
        onError={jest.fn()}
        now={moment('2019-01-01T21:00:00Z')}
      />
    )
    expect(outer).toMatchSnapshot()

    const container = outer.dive()
    expect(container).toMatchSnapshot()
  })

  it('should pass correct props to all fields', () => {
    const wrapper = shallow(
      <FormFields
        values={{ date: '2019-01-01T21:00:00Z' }}
        now={moment('2019-01-01T21:00:00Z')}
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
