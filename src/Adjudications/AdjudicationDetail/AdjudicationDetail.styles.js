import React from 'react'
import styled from 'styled-components'
import { spacing } from '@govuk-react/lib'

const WrappedText = styled.p`
  word-break: break-word;
`

export const LabelAndValue = ({ label, value }) => (
  <>
    <strong className="label">{label}</strong>
    <WrappedText>{value || '--'}</WrappedText>
  </>
)

const MarginlessPararagraph = styled.p`
  margin: 0;
`

export const Location = ({ establishment, interiorLocation }) => (
  <>
    <strong className="label">Location</strong>
    <MarginlessPararagraph>{interiorLocation || '--'}</MarginlessPararagraph>
    <p>{establishment || '--'}</p>
  </>
)

export const Section = styled.div`
  border-bottom: 3px solid #f2f2f2;
  margin-top: ${spacing.simple(2)};
`

export const GridContainer = styled.div`
  ${({ includeTrailingDivider }) => includeTrailingDivider && 'border-bottom: 1px solid #f2f2f2'};
  margin-top: ${spacing.simple(2)};
`
