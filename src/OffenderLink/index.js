import React from 'react'
import PropTypes from 'prop-types'
import { getOffenderLink, getAlertsLink } from '../links'

const OffenderLink = props => {
  const { offenderNo, alerts, children } = props
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="link"
      href={alerts ? getAlertsLink(offenderNo) : getOffenderLink(offenderNo)}
    >
      {children}
    </a>
  )
}

OffenderLink.propTypes = {
  offenderNo: PropTypes.string.isRequired,
  alerts: PropTypes.bool,
  children: PropTypes.node.isRequired,
}

OffenderLink.defaultProps = {
  alerts: false,
}

export default OffenderLink
