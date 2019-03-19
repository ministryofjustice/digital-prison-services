import styled from 'styled-components'
import { SPACING } from '@govuk-react/constants'
import { typography } from '@govuk-react/lib'

export const StyledList = styled('ul')`
  margin-bottom: ${SPACING.SCALE_4};
  ${typography.font({ size: 19 })};
  list-style-type: disc;
  padding-left: 20px;
`

export const StyledListItem = styled('li')`
  margin-bottom: ${SPACING.SCALE_1};

  p {
    margin-bottom: 0;
  }
`
