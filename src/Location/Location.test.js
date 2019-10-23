import React from 'react'
import { shallow } from 'enzyme'
import { Location } from '.'

describe('Location', () => {
  it('renders and empty string when location is not present', () => {
    const component = shallow(<Location agencyId="MDI" />)
    expect(component.equals('--')).toEqual(true)
  })

  it('renders location as supplied if its prefix does not match agencyId', () => {
    const component = shallow(<Location location="COURT" agencyId="MDI" />)
    expect(component.equals('--')).toEqual(true)
  })

  it('strips agencyId prefix from location when it matches', () => {
    const component = shallow(<Location location="MDI-1-3-017" agencyId="MDI" />)
    expect(component.equals('1-3-017')).toEqual(true)
  })
})
