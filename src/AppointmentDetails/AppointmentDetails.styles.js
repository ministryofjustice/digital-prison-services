import styled from 'styled-components'
import { BREAKPOINTS, SPACING, FONT_SIZE } from '@govuk-react/constants'

export const Container = styled('div')`
  display: flex;
  flex-direction: row;

  div {
    margin-right: ${SPACING.SCALE_4};
  }

  @media (max-width: ${BREAKPOINTS.LARGESCREEN}) {
    flex-direction: column;
    div {
      margin-bottom: ${SPACING.SCALE_2};
      margin-right: 0;
    }
  }
`

export const Info = styled('div')`
  @media (max-width: ${BREAKPOINTS.LARGESCREEN}) {
    margin-right: ${SPACING.SCALE_1};

    strong {
      font-size: ${FONT_SIZE.SIZE_16};
    }
  }
`

export const Text = styled('div')`
  margin-top: ${SPACING.SCALE_1};
  @media (max-width: ${BREAKPOINTS.LARGESCREEN}) {
    font-size: ${FONT_SIZE.SIZE_16};
  }
`

export default Container
