import styled from 'styled-components'
import Select from '@govuk-react/select'
import { spacing } from '@govuk-react/lib'
import { BREAKPOINTS, SPACING } from '@govuk-react/constants'

export const SearchContainer = styled.div`
  @media screen and (min-width: ${BREAKPOINTS.DESKTOP}) {
    display: flex;
    align-items: flex-end;
  }
  ${spacing.withWhiteSpace({ marginBottom: 6 })};
`

export const SearchInput = styled.div`
  margin-bottom: ${SPACING.SCALE_3};

  @media screen and (min-width: ${BREAKPOINTS.DESKTOP}) {
    flex: 1;
    ${spacing.responsiveMargin({ size: 3, direction: 'right' })};
    margin-bottom: 2px; /* Because it's a horizontal form :( */
  }
`

export const StyledSelect = styled(Select)`
  select {
    width: 100%;
  }
`
