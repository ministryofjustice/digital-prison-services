import styled from 'styled-components'
import { SPACING } from '@govuk-react/constants'

// eslint-disable-next-line import/prefer-default-export
export const Container = styled('form')`
  margin-bottom: ${SPACING.SCALE_5};
  display: flex;
  flex-direction: column;

  a {
    margin-bottom: ${SPACING.SCALE_5};
  }
`
