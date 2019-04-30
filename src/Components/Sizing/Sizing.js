import styled from 'styled-components'
import { MEDIA_QUERIES } from '@govuk-react/constants'

export const MobileOnly = styled.div`
  display: block;
  ${MEDIA_QUERIES.DESKTOP} {
    display: none;
  }
`

export const DesktopOnly = styled.div`
  display: none;
  ${MEDIA_QUERIES.DESKTOP} {
    display: block;
    height: 100%;
  }
`
