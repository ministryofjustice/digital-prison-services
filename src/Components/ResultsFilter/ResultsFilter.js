import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { spacing } from '@govuk-react/lib'
import { GREY_2 } from 'govuk-colours'
import { BREAKPOINTS, SPACING } from '@govuk-react/constants'
import ResultsTotals from './elements/ResultsTotals'

const StyledResultsFilter = styled.div`
  display: none;

  @media screen and (min-width: ${BREAKPOINTS.DESKTOP}) {
    display: flex;
    flex-wrap: wrap;
    border-bottom: ${props => (props.noBorder ? 'none' : `1px solid ${GREY_2}`)};
    ${spacing.withWhiteSpace({ padding: { size: 4, direction: 'bottom' } })};

    div {
      margin-right: ${SPACING.SCALE_3};
    }
  }
`

const ResultsFilter = ({ children, noBorder, perPage, pageNumber, totalResults }) => (
  <StyledResultsFilter noBorder={noBorder}>
    <ResultsTotals perPage={perPage} pageNumber={pageNumber} totalResults={totalResults} />
    {children}
  </StyledResultsFilter>
)

ResultsFilter.propTypes = {
  perPage: PropTypes.number,
  pageNumber: PropTypes.number,
  totalResults: PropTypes.number,
  children: PropTypes.node,
  noBorder: PropTypes.bool,
}

ResultsFilter.defaultProps = {
  perPage: 0,
  pageNumber: 0,
  totalResults: 0,
  children: null,
  noBorder: false,
}

export default ResultsFilter
