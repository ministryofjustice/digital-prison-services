import React from 'react'
import styled from 'styled-components'
import { SPACING } from '@govuk-react/constants'

export const LabelAndValue = ({ label, value }) => (
  <>
    <strong className="label">{label}</strong>
    <p>{value || '--'}</p>
  </>
)

const WrappedText = styled.p`
  word-break: break-word;
`

export const IncidentDetails = ({ label, value }) => (
  <>
    <strong className="label">{label}</strong>
    <WrappedText>{value || '--'}</WrappedText>
  </>
)

export const Sanction = styled.div`
  padding-bottom: ${SPACING.SCALE_5};
`
