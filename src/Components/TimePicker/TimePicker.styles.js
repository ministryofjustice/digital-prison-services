import styled from 'react-emotion'
import { SPACING, BORDER_WIDTH_FORM_ELEMENT_ERROR } from '@govuk-react/constants'
import { ERROR_COLOUR } from 'govuk-colours'

// eslint-disable-next-line import/prefer-default-export
export const Container = styled('div')`
  display: flex;
  flex-direction: row;

  select {
    width: 95% !important;
    margin-right: ${SPACING.SCALE_3} !important;
    border: ${props =>
      props.error ? `${BORDER_WIDTH_FORM_ELEMENT_ERROR} solid ${ERROR_COLOUR}` : undefined} !important;
  }
`
