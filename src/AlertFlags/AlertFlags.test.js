import React from 'react'
import { shallow } from 'enzyme'
import AlertFlags from './AlertFlags'

describe('<AlertFlags />', () => {
  it('should not render without any AlertFlags or categories', () => {
    const wrapper = shallow(<AlertFlags />)

    expect(wrapper.type()).toBe(null)
  })

  it('should display the DISABILITY (PEEP) flag', () => {
    const wrapper = shallow(<AlertFlags alerts={['PEEP']} />)

    expect(wrapper.find('.disability-status').exists()).toBe(true)
  })

  it('should display the ACCT (HA) flag', () => {
    const wrapper = shallow(<AlertFlags alerts={['HA']} />)

    expect(wrapper.find('.acct-status').exists()).toBe(true)
  })

  it('should display the E-LIST (XEL) flag', () => {
    const wrapper = shallow(<AlertFlags alerts={['XEL']} />)

    expect(wrapper.find('.elist-status').exists()).toBe(true)
  })

  it('should show CAT A flag for category A', () => {
    const wrapper = shallow(<AlertFlags category="A" />)

    expect(wrapper.find('.cata-status').exists()).toBe(true)
  })

  it('should show CAT A flag for category E', () => {
    const wrapper = shallow(<AlertFlags category="E" />)

    expect(wrapper.find('.cata-status').exists()).toBe(true)
  })

  it('should show CAT A High flag for category H', () => {
    const wrapper = shallow(<AlertFlags category="H" />)

    expect(wrapper.find('.cata-high-status').exists()).toBe(true)
  })

  it('should show CAT A Prov flag for category P', () => {
    const wrapper = shallow(<AlertFlags category="P" />)

    expect(wrapper.find('.cata-prov-status').exists()).toBe(true)
  })
})
