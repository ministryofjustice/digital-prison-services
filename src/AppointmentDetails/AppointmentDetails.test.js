import React from 'react'
import { shallow } from 'enzyme'

import AppointmentDetails from './AppointmentDetails'

describe('Appointment details', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <AppointmentDetails
        appointmentTypeDescription="ACT"
        locationDescription="GYM"
        comments="test"
        startTime="2019-03-20T:21:0:00Z"
        repeats="DAILY"
        times="5"
        recurring
      />
    )

    expect(wrapper).toMatchSnapshot()
  })

  it('should hide comment section when there is no comment to display', () => {
    const wrapper = shallow(
      <AppointmentDetails appointmentTypeDescription="ACT" locationDescription="GYM" startTime="2019-10-10T:21:0:00Z" />
    )

    expect(wrapper).toMatchSnapshot()
  })
})
