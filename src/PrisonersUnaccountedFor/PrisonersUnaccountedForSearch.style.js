import styled from 'styled-components'
import Select from '@govuk-react/select'
import { spacing } from '@govuk-react/lib'
import Link from '@govuk-react/link'
import { BORDER_COLOUR, LINK_COLOUR } from 'govuk-colours'

export const Container = styled.div`
  @media print {
    display: block;
  }
`

export const SearchContainer = styled.div`
  border-bottom: 1px solid ${BORDER_COLOUR};
  ${spacing.withWhiteSpace({ margin: { size: 3, direction: 'bottom' } })};
`

export const FullWidthSelect = styled(Select)`
  select {
    width: 100%;
  }
`

export const RightAlignContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  height: 100%;
`

export const DummyLink = styled(Link)`
  color: ${LINK_COLOUR};
  cursor: pointer;
  text-decoration: underline;
`
