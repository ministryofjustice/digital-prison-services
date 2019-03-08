import styled from 'react-emotion'
import { SPACING } from '@govuk-react/constants'

// eslint-disable-next-line import/prefer-default-export
export const Container = styled('form')`
  margin-bottom: ${SPACING.SCALE_5};
  display: flex;
  flex-direction: column;
  // justify-content: space-around;

  a {
    margin-bottom: ${SPACING.SCALE_5};
  }
`
