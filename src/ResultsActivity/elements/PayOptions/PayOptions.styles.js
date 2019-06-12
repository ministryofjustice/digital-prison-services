import styled from 'styled-components'
import { MEDIA_QUERIES, FOCUS_WIDTH } from '@govuk-react/constants'
import { FOCUS_COLOUR, LINK_HOVER_COLOUR, LINK_COLOUR } from 'govuk-colours'
import { spacing, typography } from '@govuk-react/lib'

export const Option = styled.td`
  vertical-align: top;

  label {
    margin-bottom: 0;
  }

  ${MEDIA_QUERIES.PRINT} {
    display: none;
  }
`

export const DetailsLink = styled.span`
  display: block;
  margin-top: ${spacing.simple(2)}px;
  ${typography.font({ size: 16 })};
  text-decoration: underline;
  color: ${LINK_COLOUR};
  cursor: pointer;

  &:hover {
    color: ${LINK_HOVER_COLOUR};
  }

  &:focus {
    outline: ${FOCUS_WIDTH} solid ${FOCUS_COLOUR};
  }
`
