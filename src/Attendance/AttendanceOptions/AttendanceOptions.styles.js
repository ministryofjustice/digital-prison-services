import styled from 'styled-components'
import { MEDIA_QUERIES, FOCUS_WIDTH } from '@govuk-react/constants'
import { FOCUS_COLOUR, LINK_HOVER_COLOUR, LINK_COLOUR } from 'govuk-colours'
import { typography } from '@govuk-react/lib'

export const Option = styled.td`
  display: ${props => (props.printOnly ? 'none' : 'table-cell')};
  vertical-align: top;

  label {
    margin-bottom: 0;
  }

  ${MEDIA_QUERIES.PRINT} {
    display: ${props => (props.printOnly ? 'table-cell' : 'none')};
  }
`

export const PayMessage = styled.span`
  display: block;
  margin-bottom: 0;
  width: 45%;
  text-align: center;

  ${MEDIA_QUERIES.PRINT} {
    display: none;
  }
`

export const OtherMessage = styled.span`
  ${MEDIA_QUERIES.PRINT} {
    display: none;
  }
`

export const UpdateLink = styled.span`
  display: block;
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
