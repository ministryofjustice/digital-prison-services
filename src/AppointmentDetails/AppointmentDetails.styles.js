import styled from 'react-emotion'
import { BREAKPOINTS, SPACING, FONT_SIZE } from '@govuk-react/constants'

export const Container = styled('div')`
  display: flex;
  flow-direction: column;
  justify-content: space-between;
  max-width: 80%;

  @media (max-width: 1200px) {
    max-width: 100%;
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
  hyphens: auto;
  overflow-wrap: break-word;
  word-wrap: break-word;
`

export default Container
