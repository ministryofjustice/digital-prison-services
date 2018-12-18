import React from 'react'
import { linkOnClick } from '../helpers'

import './fullFlags.scss'

const FullFlags = (alerts, divClassName, onAlertFlagClick) => {
  const addClickIfValid = () => onAlertFlagClick && linkOnClick(onAlertFlagClick)

  function isShown(code) {
    if (alerts) {
      return alerts.some(alert => {
        if (alert.get) {
          if (!alert.get('expired')) {
            if (alert.get('alertCode') === code) return true
          }
        } else if (alert === code) return true
        return false
      })
    }
    return false
  }

  return (
    <div className="full-flags">
      {isShown('HA') && (
        <span className="acct-status" {...addClickIfValid(onAlertFlagClick)}>
          ACCT OPEN
        </span>
      )}
      {isShown('XSA') && (
        <span className="assault-status" {...addClickIfValid(onAlertFlagClick)}>
          STAFF ASSAULTER
        </span>
      )}
      {isShown('XA') && (
        <span className="arsonist-status" {...addClickIfValid(onAlertFlagClick)}>
          <img src="/images/Arsonist_icon.png" className="arsonist-adjust" alt="" width="11" height="14" />
          <span> ARSONIST </span>
        </span>
      )}
      {isShown('PEEP') && (
        <span className="disability-status" {...addClickIfValid(onAlertFlagClick)}>
          <img src="/images/Disability_icon.png" className="disability-adjust" alt="" width="11" height="14" />
          <span> PEEP </span>
        </span>
      )}
      {isShown('XEL') && (
        <span className="elist-status" {...addClickIfValid(onAlertFlagClick)}>
          E&#x2011;LIST
        </span>
      )}
      {isShown('XRF') && (
        <span className="risk-females-status" {...addClickIfValid(onAlertFlagClick)}>
          RISK TO FEMALES
        </span>
      )}
      {isShown('XTACT') && (
        <span className="tact-status" {...addClickIfValid(onAlertFlagClick)}>
          TACT
        </span>
      )}
    </div>
  )
}

export default FullFlags
