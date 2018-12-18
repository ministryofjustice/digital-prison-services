import React from 'react'
import { shallow } from 'enzyme'
import HoursAndMinutes from '.'

describe('HoursAndMinutes', () => {
  it('Should render undefined time', () => {
    const wrapper = shallow(<HoursAndMinutes />)
    expect(wrapper.equals('')).toEqual(true)
  })

  it('Should render HH:mm:ss as HH:mm', () => {
    const wrapper = shallow(<HoursAndMinutes hhmmss="23:02:59" />)
    expect(wrapper.equals('23:02')).toEqual(true)
  })
})
