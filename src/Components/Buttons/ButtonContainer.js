import styled from 'styled-components'
import { spacing } from '@govuk-react/lib'

const ButtonContainer = styled.div`
  button {
    ${spacing.responsiveMargin({ size: 3, direction: 'right' })};
  }
`

export default ButtonContainer
