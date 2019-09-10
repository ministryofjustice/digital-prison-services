import React from 'react'
import PropTypes from 'prop-types'
import './AlertFlags.scss'

const AlertFlags = ({ alerts, category }) => {
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

  if (!alerts.length && !category) return null

  return (
    <div className="alerts">
      {isShown('PEEP') && (
        <>
          <span className="disability-status">PEEP</span>{' '}
        </>
      )}
      {isShown('HA') && (
        <>
          <span className="acct-status">ACCT</span>{' '}
        </>
      )}
      {isShown('XEL') && (
        <>
          <span className="elist-status">E-LIST</span>{' '}
        </>
      )}
      {(category === 'A' || category === 'E') && (
        <>
          <span className="cata-status">CAT A</span>{' '}
        </>
      )}
      {category === 'H' && (
        <>
          <span className="cata-high-status">CAT A High</span>{' '}
        </>
      )}
      {category === 'P' && (
        <>
          <span className="cata-prov-status">CAT A Prov</span>{' '}
        </>
      )}
    </div>
  )
}

AlertFlags.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.string),
  category: PropTypes.string,
}

AlertFlags.defaultProps = {
  alerts: [],
  category: undefined,
}

export default AlertFlags
