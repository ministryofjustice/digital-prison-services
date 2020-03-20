import React from 'react'
import PropTypes from 'prop-types'

import './fullFlags.scss'
import OffenderLink from '../OffenderLink'

const Flags = ({ alerts, category, offenderNo }) => {
  const withLink = content =>
    offenderNo ? (
      <OffenderLink offenderNo={offenderNo} alerts>
        {content}
      </OffenderLink>
    ) : (
      content
    )

  return (
    <div className="full-flags">
      {alerts.includes('HA') && withLink(<span className="acct-status">ACCT OPEN</span>)}
      {alerts.includes('XSA') && withLink(<span className="assault-status">STAFF ASSAULTER</span>)}
      {alerts.includes('XA') &&
        withLink(
          <span className="arsonist-status">
            <img src="/images/Arsonist_icon.png" className="arsonist-adjust" alt="" width="11" height="14" />
            <span> ARSONIST </span>
          </span>
        )}
      {alerts.includes('PEEP') &&
        withLink(
          <span className="disability-status">
            <img src="/images/Disability_icon.png" className="disability-adjust" alt="" width="11" height="14" />
            <span> PEEP </span>
          </span>
        )}
      {alerts.includes('XEL') && withLink(<span className="elist-status">E&#x2011;LIST</span>)}
      {alerts.includes('XRF') && withLink(<span className="risk-females-status">RISK TO FEMALES</span>)}
      {alerts.includes('XTACT') && withLink(<span className="tact-status">TACT</span>)}
      {alerts.includes('RNO121') && withLink(<span className="no-one-to-one-status">NO ONE-TO-ONE</span>)}
      {alerts.includes('RCON') && withLink(<span className="conflict-status">CONFLICT</span>)}
      {(category === 'A' || category === 'E') && <span className="cata-status">CAT&nbsp;A</span>}
      {category === 'H' && <span className="cata-high-status">CAT&nbsp;A&nbsp;High</span>}
      {category === 'P' && <span className="cata-prov-status">CAT&nbsp;A&nbsp;Prov</span>}
    </div>
  )
}

Flags.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  category: PropTypes.string,
  offenderNo: PropTypes.string,
}

Flags.defaultProps = {
  category: '',
  offenderNo: undefined,
}

export default Flags
