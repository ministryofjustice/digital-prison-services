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
    const flag = wrapper
      .find('AlertFlag')
      .shallow()
      .find('.disability-status')

    expect(flag.text()).toEqual('PEEP')
  })

  it('should display the ACCT (HA) flag', () => {
    const wrapper = shallow(<AlertFlags alerts={['HA']} />)
    const flag = wrapper
      .find('AlertFlag')
      .shallow()
      .find('.acct-status')

    expect(flag.text()).toEqual('ACCT')
  })

  it('should display the E-LIST (XEL) flag', () => {
    const wrapper = shallow(<AlertFlags alerts={['XEL']} />)
    const flag = wrapper
      .find('AlertFlag')
      .shallow()
      .find('.elist-status')

    expect(flag.text()).toEqual('E-LIST')
  })

  it('should display the alert flags in the correct order', () => {
    const wrapper = shallow(<AlertFlags alerts={['PEEP', 'HA', 'XEL']} category="A" />)
    const flags = wrapper.find('AlertFlag')
    const firstFlag = flags.at(0).shallow()
    const secondFlag = flags.at(1).shallow()
    const thirdFlag = flags.at(2).shallow()
    const fourthFlag = flags.at(3).shallow()

    expect(firstFlag.text()).toEqual('ACCT ')
    expect(secondFlag.text()).toEqual('E-LIST ')
    expect(thirdFlag.text()).toEqual('PEEP ')
    expect(fourthFlag.text()).toEqual('CAT A ')
  })

  it('should show CAT A flag for category A', () => {
    const wrapper = shallow(<AlertFlags category="A" />)
    const flag = wrapper
      .find('AlertFlag')
      .shallow()
      .find('.cata-status')

    expect(flag.text()).toEqual('CAT A')
  })

  it('should show CAT A flag for category E', () => {
    const wrapper = shallow(<AlertFlags category="E" />)
    const flag = wrapper
      .find('AlertFlag')
      .shallow()
      .find('.cata-status')

    expect(flag.text()).toEqual('CAT A')
  })

  it('should show CAT A High flag for category H', () => {
    const wrapper = shallow(<AlertFlags category="H" />)
    const flag = wrapper
      .find('AlertFlag')
      .shallow()
      .find('.cata-high-status')

    expect(flag.text()).toEqual('CAT A High')
  })

  it('should show CAT A Prov flag for category P', () => {
    const wrapper = shallow(<AlertFlags category="P" />)
    const flag = wrapper
      .find('AlertFlag')
      .shallow()
      .find('.cata-prov-status')

    expect(flag.text()).toEqual('CAT A Prov')
  })
})
