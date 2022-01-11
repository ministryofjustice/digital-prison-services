import styled from 'styled-components'
import Link from '@govuk-react/link'
import { FONT_SIZE } from '@govuk-react/constants'
import { LINK_COLOUR, LINK_HOVER_COLOUR } from 'govuk-colours'

export const PrintLink = styled(Link)`
  font-size: ${FONT_SIZE.SIZE_16};
  color: ${LINK_COLOUR};
  cursor: pointer;
  text-decoration: underline;
  display: inline-block;
  margin: 0 0 15px -10px;
  position: relative;
  padding: 0.5em 0 0.5em 38px;
  background: url('images/Printer_icon.png') no-repeat 10px 50%;
  background-size: 16px 18px;

  &:hover {
    color: ${LINK_HOVER_COLOUR};
  }
`

export default PrintLink
