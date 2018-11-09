import React from 'react'
import { linkOnClick } from '../helpers'
import './flags.scss'

const AlertFlags = (alerts, category, divClassName, onAlertFlagClick) => {
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
    <div className={divClassName}>
      {isShown('HA') && (
        <span className="acct-status" {...linkOnClick(onAlertFlagClick)}>
          ACCT
        </span>
      )}
      {isShown('XEL') && (
        <span className="elist-status" {...linkOnClick(onAlertFlagClick)}>
          E-LIST
        </span>
      )}
      {(category === 'A' || category === 'E') && <span className="cata-status">CAT&nbsp;A</span>}
      {category === 'H' && <span className="cata-high-status">CAT&nbsp;A&nbsp;H</span>}
      {category === 'P' && <span className="cata-prov-status">CAT&nbsp;A&nbsp;Prov</span>}
    </div>
  )
}

const flags = { AlertFlags }
export default flags
