import styled from 'react-emotion'

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
`

export const Section = styled('div')`
  width: 50%;
`

export const FullWidthDiv = styled('div')`
  width: 100% !important;
`
