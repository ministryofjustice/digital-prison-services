import React from 'react'
import { shallow } from 'enzyme'
import Age, { ageFromIsoDate } from '.'

describe('ISO date string to age in years', () => {
  it('converts a valid ISO date to age', () => {
    expect(ageFromIsoDate('1961-12-10')).toBe(57)
    expect(ageFromIsoDate('1961-12-11')).toBe(57)
    expect(ageFromIsoDate('1961-12-12')).toBe(56)
  })

  it('renders a valid ISO date as an age in years', () => {
    const component = shallow(<Age dateOfBirth="1961-05-29" />)
    expect(component.equals(57)).toEqual(true)
  })

  it('renders an undefined ISO date as the empty string', () => {
    const component = shallow(<Age dateOfBirth={undefined} />)
    expect(component.equals('')).toEqual(true)
  })

  it('renders an empty string ISO date as the empty string', () => {
    const component = shallow(<Age dateOfBirth="" />)
    expect(component.equals('')).toEqual(true)
  })
})
