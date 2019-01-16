import React from 'react'
import PropTypes from 'prop-types'

const OffenderImage = props => {
  const { offenderNo } = props
  const offenderImageUrl = `/app/images/${offenderNo}/data`
  return <img id={`image-${offenderNo}`} alt={`prisoner ${offenderNo}`} className="photo" src={offenderImageUrl} />
}

OffenderImage.propTypes = {
  offenderNo: PropTypes.string.isRequired,
}

export default OffenderImage
