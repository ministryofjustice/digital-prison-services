import React from 'react'
import { shallow } from 'enzyme'

import Flags from './Flags'
import OffenderLink from '../OffenderLink'

describe('Flags.', () => {
  describe('Alerts with links', () => {
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

    it('RNO121 alert', () => {
      const wrapper = shallow(<Flags alerts={['RNO121']} offenderNo="X0000XX" />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <OffenderLink offenderNo="X0000XX" alerts>
              <span className="no-one-to-one-status">NO ONE-TO-ONE</span>
            </OffenderLink>
          </div>
        )
      ).toEqual(true)
    })

    it('RCON alert', () => {
      const wrapper = shallow(<Flags alerts={['RCON']} offenderNo="X0000XX" />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <OffenderLink offenderNo="X0000XX" alerts>
              <span className="conflict-status">CONFLICT</span>
            </OffenderLink>
          </div>
        )
      ).toEqual(true)
    })

    it('RCDR alert', () => {
      const wrapper = shallow(<Flags alerts={['RCDR']} offenderNo="X0000XX" />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <OffenderLink offenderNo="X0000XX" alerts>
              <span className="quarantined-status">QUARANTINED</span>
            </OffenderLink>
          </div>
        )
      ).toEqual(true)
    })

    it('URCU alert', () => {
      const wrapper = shallow(<Flags alerts={['URCU']} offenderNo="X0000XX" />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <OffenderLink offenderNo="X0000XX" alerts>
              <span className="reverse-cohorting-unit-status">REVERSE COHORTING UNIT</span>
            </OffenderLink>
          </div>
        )
      ).toEqual(true)
    })

    it('UPIU alert', () => {
      const wrapper = shallow(<Flags alerts={['UPIU']} offenderNo="X0000XX" />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <OffenderLink offenderNo="X0000XX" alerts>
              <span className="protective-isolation-unit-status">PROTECTIVE ISOLATION UNIT</span>
            </OffenderLink>
          </div>
        )
      ).toEqual(true)
    })

    it('USU alert', () => {
      const wrapper = shallow(<Flags alerts={['USU']} offenderNo="X0000XX" />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <OffenderLink offenderNo="X0000XX" alerts>
              <span className="shielding-unit-status">SHIELDING UNIT</span>
            </OffenderLink>
          </div>
        )
      ).toEqual(true)
    })

    it('URS alert', () => {
      const wrapper = shallow(<Flags alerts={['URS']} offenderNo="X0000XX" />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <OffenderLink offenderNo="X0000XX" alerts>
              <span className="refusing-to-shield-status">REFUSING TO SHIELD</span>
            </OffenderLink>
          </div>
        )
      ).toEqual(true)
    })
  })
  describe('Alerts without links', () => {
    it('HA alert', () => {
      const wrapper = shallow(<Flags alerts={['HA', 'HA']} />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <span className="acct-status">ACCT OPEN</span>
          </div>
        )
      ).toEqual(true)
    })

    it('XSA alert', () => {
      const wrapper = shallow(<Flags alerts={['XSA']} />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <span className="assault-status">STAFF ASSAULTER</span>
          </div>
        )
      ).toEqual(true)
    })

    it('XA alert', () => {
      const wrapper = shallow(<Flags alerts={['XA']} />)
      expect(
        wrapper.matchesElement(
          <div className="full-flags">
            <span className="arsonist-status">
              <img src="/images/Arsonist_icon.png" className="arsonist-adjust" alt="" width="11" height="14" />
              <span>ARSONIST</span>
            </span>
          </div>
        )
      ).toEqual(true)
    })

    it('PEEP alert', () => {
      const wrapper = shallow(<Flags alerts={['PEEP']} />)
      expect(
        wrapper.matchesElement(
          <div className="full-flags">
            <span className="disability-status">
              <img src="/images/Disability_icon.png" className="disability-adjust" alt="" width="11" height="14" />
              <span>PEEP</span>
            </span>
          </div>
        )
      ).toEqual(true)
    })

    it('XEL alert', () => {
      const wrapper = shallow(<Flags alerts={['XEL']} />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <span className="elist-status">E‑LIST</span>
          </div>
        )
      ).toEqual(true)
    })

    it('XRF alert', () => {
      const wrapper = shallow(<Flags alerts={['XRF']} />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <span className="risk-females-status">RISK TO FEMALES</span>
          </div>
        )
      ).toEqual(true)
    })

    it('XTACT alert', () => {
      const wrapper = shallow(<Flags alerts={['XTACT']} />)
      expect(
        wrapper.equals(
          <div className="full-flags">
            <span className="tact-status">TACT</span>
          </div>
        )
      ).toEqual(true)
    })
  })
  describe('Category flags', () => {
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
})
