import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { spacing } from '@govuk-react/lib'

const StyledResultsTotals = styled.div`
  flex: 1 0 100%;
  ${spacing.withWhiteSpace({ margin: { size: 3, direction: 'bottom' } })} margin-right: 0;
`

const ResultsTotals = ({ perPage, pageNumber, totalResults }) => (
  <StyledResultsTotals>
    {Math.min(perPage * pageNumber + 1, totalResults)} - {Math.min(perPage * (pageNumber + 1), totalResults)} of{' '}
    {totalResults} results
  </StyledResultsTotals>
)

ResultsTotals.propTypes = {
  perPage: PropTypes.number,
  pageNumber: PropTypes.number,
  totalResults: PropTypes.number,
}

ResultsTotals.defaultProps = {
  perPage: 0,
  pageNumber: 0,
  totalResults: 0,
}

export default ResultsTotals
