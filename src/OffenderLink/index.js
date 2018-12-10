import React from 'react'
import PropTypes from 'prop-types'
import { getOffenderLink } from '../links'

const OffenderLink = props => {
  const { offenderNo, children } = props
  return (
    <a target="_blank" rel="noopener noreferrer" className="link" href={getOffenderLink(offenderNo)}>
      {children}
    </a>
  )
}

OffenderLink.propTypes = {
  offenderNo: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default OffenderLink
