import React from 'react'
import { shallow } from 'enzyme'
import OffenderName from '.'

describe('OffenderName', () => {
  it("renders an offender's name correctly", () => {
    const component = shallow(<OffenderName firstName="ERIC" lastName="DEREK" />)
    expect(component.equals('Derek, Eric')).toEqual(true)
  })
})
