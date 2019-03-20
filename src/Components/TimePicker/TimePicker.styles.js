import styled from 'styled-components'
import { SPACING, BORDER_WIDTH_FORM_ELEMENT } from '@govuk-react/constants'
import { ERROR_COLOUR } from 'govuk-colours'
import { spacing } from '@govuk-react/lib'

// eslint-disable-next-line import/prefer-default-export
export const Container = styled('div')`
  display: flex;
  ${spacing.withWhiteSpace({ marginBottom: 6 })};

  span {
    padding-bottom: 0;
  }
  select {
    width: 95% !important;
    margin-right: ${SPACING.SCALE_3} !important;
    border: ${props => (props.error ? `${BORDER_WIDTH_FORM_ELEMENT} solid ${ERROR_COLOUR}` : undefined)} !important;
  }
`
