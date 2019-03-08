import styled from 'react-emotion'

import { SPACING } from '@govuk-react/constants'

// eslint-disable-next-line import/prefer-default-export
export const Container = styled('form')`
  margin-top: ${SPACING.SCALE_5};

  button {
    margin-top: ${SPACING.SCALE_5};
  }
`
export const Divider = styled('div')`
  border: solid 1px #979797;
  width: 100%;
  margin-bottom: ${SPACING.SCALE_5};
  margin-top: ${SPACING.SCALE_2};
`
export const ButtonContainer = styled('div')`
  display: flex;
  flex-direction: row;
  button {
    margin-right: ${SPACING.SCALE_2};
  }
`
