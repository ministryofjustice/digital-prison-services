import React from 'react'
import { shallow } from 'enzyme'
import DateFormatter from '.'

describe('DateFormatter', () => {
  it('Should render undefined date', () => {
    const wrapper = shallow(<DateFormatter />)
    expect(wrapper.equals('')).toEqual(true)
  })

  it('Should render an ISO format string as DD/MM/YYYY', () => {
    const wrapper = shallow(<DateFormatter isoDate="2018-12-11" />)
    expect(wrapper.equals('11/12/2018')).toEqual(true)
  })
})
