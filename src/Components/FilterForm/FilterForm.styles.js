import styled from 'styled-components'
import { WHITE } from 'govuk-colours'
import { MEDIA_QUERIES, SPACING } from '@govuk-react/constants'
import GridCol from '@govuk-react/grid-col'
import { H3 } from '@govuk-react/heading'
import { typography } from '@govuk-react/lib'
import Select from '@govuk-react/select'

export const FullWidthSelect = styled(Select)`
  select {
    width: 100% !important;
    background-color: ${WHITE};
  }
`

export const SearchArea = styled.div`
  background: #f2f2f2;
  padding: ${SPACING.SCALE_5};
  padding-bottom: ${SPACING.SCALE_3};
  margin-bottom: ${SPACING.SCALE_5};
`

export const LargeScreenOnlyGridCol = styled(GridCol)`
  display: none;
  ${MEDIA_QUERIES.TABLET} {
    display: block;
    height: 100%;
  }
`

export const FiltersLabel = styled(H3)`
  padding-left: ${SPACING.SCALE_3};
  margin-bottom: ${SPACING.SCALE_2};
  margin-top: -${SPACING.SCALE_2};
`

export const DateRangeLabel = styled.span`
  padding-left: ${SPACING.SCALE_3};
  ${typography.font({ size: 19 })};
  font-weight: bold;
  margin-top: ${SPACING.SCALE_1};
`
