import React from 'react'
import { shallow } from 'enzyme'
import InReception from './InReception'

describe('In Reception', () => {
  it('should render the page correctly', () => {
    const inReception = [
      {
        offenderNo: 'offenderNo',
        firstName: 'firstName',
        lastName: 'lastName',
        timeOut: '12:00',
        fromAgencyDescription: 'Leeds',
        dateOfBirth: '1980-10-10',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
        iepLevel: 'Entry',
      },
    ]
    const wrapper = shallow(<InReception setColumnSort={jest.fn()} sortOrder="ASC" rows={inReception} />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should display fromCity when fromAgencyDescription is not set ', () => {
    const inReception = [
      {
        offenderNo: 'offenderNo',
        firstName: 'firstName',
        lastName: 'lastName',
        timeOut: '12:00',
        fromCity: 'York',
        dateOfBirth: '1980-10-10',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
        iepLevel: 'Entry',
      },
    ]
    const wrapper = shallow(<InReception setColumnSort={jest.fn()} sortOrder="ASC" rows={inReception} />)

    expect(wrapper).toMatchSnapshot()
  })
})
