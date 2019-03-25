import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { BREAKPOINTS } from '@govuk-react/constants'

export const StyledImage = styled.img`
  max-width: 70px;

  @media (min-width: ${BREAKPOINTS.DESKTOP}) {
    max-width: 90px;
  }
`

const OffenderImage = props => {
  const { offenderNo } = props
  const offenderImageUrl = `/app/images/${offenderNo}/data`
  return <StyledImage id={`image-${offenderNo}`} alt={`prisoner ${offenderNo}`} src={offenderImageUrl} />
}

OffenderImage.propTypes = {
  offenderNo: PropTypes.string.isRequired,
}

export default OffenderImage
