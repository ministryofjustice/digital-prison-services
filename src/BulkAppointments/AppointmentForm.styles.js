import styled from 'react-emotion'
import { BREAKPOINTS, SPACING } from '@govuk-react/constants'

export const HorizontallyStacked = styled('div')`
  display: flex;
  flex-direction: row;

  .form-control {
    width: 100% !important;
  }

  div:first-child {
    margin-right: 5px;
  }
`
export const Container = styled('div')`
  display: flex;
  flex-direction: row;
  @media (max-width: ${BREAKPOINTS.TABLET}) {
    flex-direction: column;
  }
`

export const Section = styled('div')`
  width: 50%;
  @media (max-width: ${BREAKPOINTS.TABLET}) {
    width: 100%;
    margin-bottom: ${SPACING.SCALE_5};
  }
`

export const ButtonContainer = styled('div')`
  display: flex;
  flex-direction: row;
  button {
    margin-right: ${SPACING.SCALE_2};
  }
`
