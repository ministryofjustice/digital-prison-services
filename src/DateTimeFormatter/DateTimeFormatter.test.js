import React from 'react'
import { shallow } from 'enzyme'
import DateTimeFormatter from '.'

describe('DateTimeFormatter', () => {
  it('Should render undefined date', () => {
    const wrapper = shallow(<DateTimeFormatter />)
    expect(wrapper.equals('')).toEqual(true)
  })

  it('Should render an ISO format string as DD/MM/YYYY', () => {
    const wrapper = shallow(<DateTimeFormatter isoDate="2018-12-11 10:20" />)
    expect(wrapper.equals('11/12/2018 - 10:20')).toEqual(true)
  })
})
