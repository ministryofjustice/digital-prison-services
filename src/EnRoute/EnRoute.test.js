import React from 'react'
import { shallow } from 'enzyme'

import EnRoute from './EnRoute'

describe('En route', () => {
  it('should render page correctly', () => {
    const movements = [
      {
        offenderNo: 'G0000GG',
        firstName: 'firstName',
        lastName: 'lastName',
        movementTime: '12:01:02',
        movementDate: '2019-10-10',
        fromAgencyDescription: 'Hull (HMP)',
        movementReasonDescription: 'Normal transfer',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
      },
    ]
    const wrapper = shallow(<EnRoute sortOrder="ASC" setColumnSort={jest.fn()} rows={movements} />)

    expect(wrapper).toMatchSnapshot()
  })
})
