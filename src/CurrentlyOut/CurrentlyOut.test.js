import React from 'react'
import { shallow } from 'enzyme'

import CurrentlyOut from './CurrentlyOut'

describe('Currently out', () => {
  it('should render the page', () => {
    const offenders = [
      {
        offenderNo: 'G000GG',
        firstName: 'FirstName',
        lastName: 'LastName',
        location: 'MDI-1-3-017',
        dateOfBirth: '1960-12-31',
        ipeLevel: 'standard',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
        category: 'C',
        toAgencyDescription: 'To Agency Description',
        commentText: 'Comment text',
      },
    ]
    const wrapper = shallow(<CurrentlyOut sortOrer="ASC" setColumnSort={jest.fn()} rows={offenders} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('should display toCity when toAgencyDescription is not set ', () => {
    const offenders = [
      {
        offenderNo: 'G000GG',
        firstName: 'FirstName',
        lastName: 'LastName',
        location: 'MDI-1-3-017',
        dateOfBirth: '1960-12-31',
        ipeLevel: 'standard',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
        category: 'C',
        toCity: 'York',
        commentText: 'Comment text',
      },
    ]
    const wrapper = shallow(<CurrentlyOut sortOrer="ASC" setColumnSort={jest.fn()} rows={offenders} />)
    expect(wrapper).toMatchSnapshot()
  })
})
