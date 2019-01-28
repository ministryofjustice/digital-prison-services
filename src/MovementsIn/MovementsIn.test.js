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

  it('should remove the offender link when the location is not set', () => {
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

  it('should remove the offender link when the toAgencyId does not match the current agencyId/active case load', () => {
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

  it('should display fromCity when fromAgencyDescription is not set ', () => {
    const offenders = [
      {
        offenderNo: 'G0000GG',
        firstName: 'firstName',
        lastName: 'lastName',
        movementTime: '12:01:02',
        location: 'CELL-1',
        fromCity: 'York',
        toAgencyCode: 'HLI',
        alerts: ['HA', 'XSA', 'XA', 'PEEP', 'XEL', 'XRF', 'XTACT'],
      },
    ]
    const wrapper = shallow(<MovementsIn sortOrder="ASC" setColumnSort={jest.fn()} rows={offenders} agencyId="LEI" />)
    expect(wrapper).toMatchSnapshot()
  })
})
