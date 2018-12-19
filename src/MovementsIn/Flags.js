import React from 'react'
import PropTypes from 'prop-types'

import '../FullFlags/fullFlags.scss'
import OffenderLink from '../OffenderLink'

const Flags = ({ alerts, category, offenderNo }) => (
  <div className="full-flags">
    {alerts.includes('HA') && (
      <OffenderLink offenderNo={offenderNo} alerts>
        <span className="acct-status">ACCT OPEN</span>
      </OffenderLink>
    )}
    {alerts.includes('XSA') && (
      <OffenderLink offenderNo={offenderNo} alerts>
        <span className="assault-status">STAFF ASSAULTER</span>
      </OffenderLink>
    )}
    {alerts.includes('XA') && (
      <OffenderLink offenderNo={offenderNo} alerts>
        <span className="arsonist-status">
          <img src="/images/Arsonist_icon.png" className="arsonist-adjust" alt="" width="11" height="14" />
          <span> ARSONIST </span>
        </span>
      </OffenderLink>
    )}
    {alerts.includes('PEEP') && (
      <OffenderLink offenderNo={offenderNo} alerts>
        <span className="disability-status">
          <img src="/images/Disability_icon.png" className="disability-adjust" alt="" width="11" height="14" />
          <span> PEEP </span>
        </span>
      </OffenderLink>
    )}
    {alerts.includes('XEL') && (
      <OffenderLink offenderNo={offenderNo} alerts>
        <span className="elist-status">E&#x2011;LIST</span>
      </OffenderLink>
    )}
    {alerts.includes('XRF') && (
      <OffenderLink offenderNo={offenderNo} alerts>
        <span className="risk-females-status">RISK TO FEMALES</span>
      </OffenderLink>
    )}
    {alerts.includes('XTACT') && (
      <OffenderLink offenderNo={offenderNo} alerts>
        <span className="tact-status">TACT</span>
      </OffenderLink>
    )}
    {(category === 'A' || category === 'E') && <span className="cata-status">CAT&nbsp;A</span>}
    {category === 'H' && <span className="cata-high-status">CAT&nbsp;A&nbsp;High</span>}
    {category === 'P' && <span className="cata-prov-status">CAT&nbsp;A&nbsp;Prov</span>}
  </div>
)

Flags.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  category: PropTypes.string,
  offenderNo: PropTypes.string.isRequired,
}

Flags.defaultProps = {
  category: '',
}

export default Flags
