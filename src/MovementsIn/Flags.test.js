import React from 'react'
import { shallow } from 'enzyme'

import Flags from './Flags'
import OffenderLink from '../OffenderLink'

describe('Flags', () => {
  it('renders no alerts and no category', () => {
    const wrapper = shallow(<Flags alerts={[]} offenderNo="X0000XX" />)
    expect(wrapper.equals(<div className="full-flags" />)).toEqual(true)
  })

  it('HA alert', () => {
    const wrapper = shallow(<Flags alerts={['HA', 'HA']} offenderNo="X0000XX" />)
    expect(
      wrapper.equals(
        <div className="full-flags">
          <OffenderLink offenderNo="X0000XX" alerts>
            <span className="acct-status">ACCT OPEN</span>
          </OffenderLink>
        </div>
      )
    ).toEqual(true)
  })

  it('XSA alert', () => {
    const wrapper = shallow(<Flags alerts={['XSA']} offenderNo="X0000XX" />)
    expect(
      wrapper.equals(
        <div className="full-flags">
          <OffenderLink offenderNo="X0000XX" alerts>
            <span className="assault-status">STAFF ASSAULTER</span>
          </OffenderLink>
        </div>
      )
    ).toEqual(true)
  })

  it('XA alert', () => {
    const wrapper = shallow(<Flags alerts={['XA']} offenderNo="X0000XX" />)
    expect(
      wrapper.matchesElement(
        <div className="full-flags">
          <OffenderLink offenderNo="X0000XX" alerts>
            <span className="arsonist-status">
              <img src="/images/Arsonist_icon.png" className="arsonist-adjust" alt="" width="11" height="14" />
              <span>ARSONIST</span>
            </span>
          </OffenderLink>
        </div>
      )
    ).toEqual(true)
  })

  it('PEEP alert', () => {
    const wrapper = shallow(<Flags alerts={['PEEP']} offenderNo="X0000XX" />)
    expect(
      wrapper.matchesElement(
        <div className="full-flags">
          <OffenderLink offenderNo="X0000XX" alerts>
            <span className="disability-status">
              <img src="/images/Disability_icon.png" className="disability-adjust" alt="" width="11" height="14" />
              <span>PEEP</span>
            </span>
          </OffenderLink>
        </div>
      )
    ).toEqual(true)
  })

  it('XEL alert', () => {
    const wrapper = shallow(<Flags alerts={['XEL']} offenderNo="X0000XX" />)
    expect(
      wrapper.equals(
        <div className="full-flags">
          <OffenderLink offenderNo="X0000XX" alerts>
            <span className="elist-status">E‑LIST</span>
          </OffenderLink>
        </div>
      )
    ).toEqual(true)
  })

  it('XRF alert', () => {
    const wrapper = shallow(<Flags alerts={['XRF']} offenderNo="X0000XX" />)
    expect(
      wrapper.equals(
        <div className="full-flags">
          <OffenderLink offenderNo="X0000XX" alerts>
            <span className="risk-females-status">RISK TO FEMALES</span>
          </OffenderLink>
        </div>
      )
    ).toEqual(true)
  })

  it('XTACT alert', () => {
    const wrapper = shallow(<Flags alerts={['XTACT']} offenderNo="X0000XX" />)
    expect(
      wrapper.equals(
        <div className="full-flags">
          <OffenderLink offenderNo="X0000XX" alerts>
            <span className="tact-status">TACT</span>
          </OffenderLink>
        </div>
      )
    ).toEqual(true)
  })

  it('Category A', () => {
    const wrapper = shallow(<Flags category="A" alerts={[]} offenderNo="X0000XX" />)
    expect(
      wrapper.equals(
        <div className="full-flags">
          <span className="cata-status">CAT A</span>
        </div>
      )
    )
  })

  it('Category E', () => {
    const wrapper = shallow(<Flags category="E" alerts={[]} offenderNo="X0000XX" />)
    expect(
      wrapper.equals(
        <div className="full-flags">
          <span className="cata-status">CAT A</span>
        </div>
      )
    )
  })

  it('Category H', () => {
    const wrapper = shallow(<Flags category="H" alerts={[]} offenderNo="X0000XX" />)
    expect(
      wrapper.equals(
        <div className="full-flags">
          <span className="cata-high-status">CAT A High</span>
        </div>
      )
    )
  })

  it('Category P', () => {
    const wrapper = shallow(<Flags category="P" alerts={[]} offenderNo="X0000XX" />)
    expect(
      wrapper.equals(
        <div className="full-flags">
          <span className="cata-high-status">CAT A Prov</span>
        </div>
      )
    )
  })
})
