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
        toAgencyId: 'MDI',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
      },
    ]
    const wrapper = shallow(<MovementsIn sortOrder="ASC" setColumnSort={jest.fn()} rows={movements} agencyId="MDI" />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should not make the offender clickable because there is no assigned location', () => {
    const movements = [
      {
        offenderNo: 'G0000GG',
        firstName: 'firstName',
        lastName: 'lastName',
        movementTime: '12:01:02',
        fromAgencyDescription: 'Hull (HMP)',
        toAgencyCode: 'HLI',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
      },
    ]
    const wrapper = shallow(<MovementsIn sortOrder="ASC" setColumnSort={jest.fn()} rows={movements} agencyId="HLI" />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should not make the offender clickable because there their toAgencyId does not match to active caseload', () => {
    const movements = [
      {
        offenderNo: 'G0000GG',
        firstName: 'firstName',
        lastName: 'lastName',
        movementTime: '12:01:02',
        location: 'CELL-1',
        fromAgencyDescription: 'Hull (HMP)',
        toAgencyCode: 'HLI',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
      },
    ]
    const wrapper = shallow(<MovementsIn sortOrder="ASC" setColumnSort={jest.fn()} rows={movements} agencyId="LEI" />)

    expect(wrapper).toMatchSnapshot()
  })
})
