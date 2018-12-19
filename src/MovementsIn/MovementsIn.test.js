import React from 'react'
import { shallow } from 'enzyme'

import MovementsIn from './MovementsIn'

describe('Movements in', () => {
  it('should render page correctly', () => {
    const movements = [
      {
        offenderNo: 'G0000GG',
        firstName: 'firstName',
        lastName: 'lastName',
        location: 'MDI-1-3-017',
        movementTime: '12:01:02',
        fromAgencyDescription: 'Hull (HMP)',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
      },
    ]
    const wrapper = shallow(<MovementsIn sortOrder="ASC" setColumnSort={jest.fn()} movementsIn={movements} />)

    expect(wrapper).toMatchSnapshot()
  })
})
