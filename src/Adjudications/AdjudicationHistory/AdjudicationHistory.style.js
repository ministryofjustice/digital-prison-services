import styled from 'styled-components'
import Select from '@govuk-react/select'
import GridCol from '@govuk-react/grid-col'
import { H3 } from '@govuk-react/heading'
import { GREY_3, WHITE } from 'govuk-colours'
import { SPACING, FONT_SIZE, MEDIA_QUERIES } from '@govuk-react/constants'

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

export const LargeSreenOnlyGridCol = styled(GridCol)`
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
  font-weight: bold;
  padding-left: ${SPACING.SCALE_2};
  font-size: ${FONT_SIZE.SIZE_18}
  margin-top:  ${SPACING.SCALE_1};
`
