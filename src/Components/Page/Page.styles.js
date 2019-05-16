import styled from 'styled-components'
import { SPACING } from '@govuk-react/constants'

export const Breadcrumbs = styled('div')`
  padding-top: ${SPACING.SCALE_3};
`
export const Container = styled('div')`
  padding-top: ${SPACING.SCALE_4};
  @media print {
    padding-top: 0;
  }
`

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
`
