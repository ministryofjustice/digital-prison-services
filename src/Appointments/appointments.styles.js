import styled from 'react-emotion'

// eslint-disable-next-line import/prefer-default-export
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
export const FlexContainer = styled('div')`
  display: flex;
  flex-direction: ${props => props.direction};
`

export const Section = styled('div')`
  width: 50%;
`

export const FullWidthDiv = styled('div')`
  width: 100% !important;
`
