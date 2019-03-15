import React from 'react'
import PropTypes from 'prop-types'

import ErrorText from '@govuk-react/error-text'
import Label from '@govuk-react/label'
import LabelText from '@govuk-react/label-text'
import HintText from '@govuk-react/hint-text'
import styled from 'styled-components'
import Input from '@govuk-react/input'

import { inputType, metaType } from '../../types'

const StyledInput = styled(Input)`
  width: 65px;
`
const NumericInput = ({ label, hint, meta, input }) => (
  <Label error={meta.error}>
    <LabelText> {label} </LabelText>
    {hint && <HintText> {hint} </HintText>}
    {meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>}
    <StyledInput type="number" error={meta.touched && meta.error} {...input} />
  </Label>
)

NumericInput.propTypes = {
  input: inputType.isRequired,
  meta: metaType,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
}

NumericInput.defaultProps = {
  meta: {},
  hint: null,
}

export default NumericInput
