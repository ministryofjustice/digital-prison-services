import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './AlertFlags.scss'

const Flag = ({ children, ...props }) => (
  <Fragment>
    <span {...props}>{children}</span>{' '}
  </Fragment>
)

Flag.propTypes = {
  children: PropTypes.string.isRequired,
}

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
      {isShown('PEEP') && <Flag className="disability-status">PEEP</Flag>}
      {isShown('HA') && <Flag className="acct-status">ACCT</Flag>}
      {isShown('XEL') && <Flag className="elist-status">E-LIST</Flag>}
      {(category === 'A' || category === 'E') && <Flag className="cata-status">CAT A</Flag>}
      {category === 'H' && <Flag className="cata-high-status">CAT A High</Flag>}
      {category === 'P' && <Flag className="cata-prov-status">CAT A Prov</Flag>}
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
