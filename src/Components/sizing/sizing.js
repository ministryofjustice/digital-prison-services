import styled from 'styled-components'
import { MEDIA_QUERIES } from '@govuk-react/constants'

export const SmallScreenOnly = styled.div`
  display: block;
  ${MEDIA_QUERIES.TABLET} {
    display: none;
  }
`

export const LargeScreenOnly = styled.div`
  display: none;
  ${MEDIA_QUERIES.TABLET} {
    display: block;
    height: 100%;
  }
`
