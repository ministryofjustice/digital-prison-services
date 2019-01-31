import styled from 'react-emotion'
import { SPACING } from '@govuk-react/constants'

// eslint-disable-next-line import/prefer-default-export
export const Container = styled('div')`
  display: flex;
  flex-direction: row;

  select {
    width: 95% !important;
    margin-right: ${SPACING.SCALE_3} !important;
  }
`
