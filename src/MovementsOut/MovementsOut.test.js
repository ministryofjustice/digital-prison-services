import React from 'react'
import { shallow } from 'enzyme'

import MovementsOut from './MovementsOut'

describe('Movements out', () => {
  it('should render page correctly', () => {
    const movements = [
      {
        offenderNo: 'offenderNo',
        firstName: 'firstName',
        lastName: 'lastName',
        timeOut: '12:00',
        reasonDescription: 'reasonDescription',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
      },
    ]
    const wrapper = shallow(<MovementsOut sortOrder="ASC" setColumnSort={jest.fn()} rows={movements} />)

    expect(wrapper).toMatchSnapshot()
  })
})
