import styled from 'styled-components'
import { MEDIA_QUERIES, SPACING } from '@govuk-react/constants'
import Select from '@govuk-react/select'
import { GREY_3, WHITE } from 'govuk-colours'
import GridCol from '@govuk-react/grid-col'
import { H3 } from '@govuk-react/heading'
import { typography } from '@govuk-react/lib'

export const CurrentIepLevelArea = styled.div`
  margin-bottom: ${SPACING.SCALE_4};
`
export const FullWidthSelect = styled(Select)`
  select {
    width: 100% !important;
    background-color: ${WHITE};
  }
`

export const SearchArea = styled.div`
  background: ${GREY_3};
  padding: ${SPACING.SCALE_5};
  margin-bottom: ${SPACING.SCALE_3};
`

export const LargeScreenOnlyGridCol = styled(GridCol)`
  display: none;
  ${MEDIA_QUERIES.TABLET} {
    display: block;
    height: 100%;
  }
`
export const FiltersLabel = styled(H3)`
  padding-left: ${SPACING.SCALE_2};
  margin-bottom: ${SPACING.SCALE_2};
  margin-top: -${SPACING.SCALE_2};
`
export const DateRangeLabel = styled.span`
  padding-left: ${SPACING.SCALE_2};
  ${typography.font({ size: 19 })};
  font-weight: bold;
  margin-top: ${SPACING.SCALE_1};
`
