import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React from 'react'
import { getOffenderLink } from '../../links'

export const OffenderBreadcrumb = props => {
  const {
    match: {
      params: { offenderNo },
    },
  } = props
  const { firstName, lastName } = props
  if (!firstName || !lastName) {
    return <span>Unknown</span>
  }
  const fullName = `${lastName}, ${firstName}`
  return <a href={getOffenderLink(offenderNo)}>{fullName}</a>
}

OffenderBreadcrumb.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      offenderNo: PropTypes.string.isRequired,
    }),
  }).isRequired,
}

OffenderBreadcrumb.defaultProps = {
  firstName: '',
  lastName: '',
}

const mapStateToProps = state => ({
  ...state.offenderDetails,
})

export default connect(mapStateToProps)(OffenderBreadcrumb)
