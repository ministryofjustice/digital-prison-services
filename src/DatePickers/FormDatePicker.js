import React, { Component } from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'

import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import LabelText from '@govuk-react/label-text'
import Label from '@govuk-react/label'
import ErrorText from '@govuk-react/error-text'
import Input from '@govuk-react/input'

class FormDatePicker extends Component {
  constructor(props) {
    super(props)
    this.renderInput = this.renderInput.bind(this)
  }

  renderInput(props) {
    const { label, meta, placeholder, input } = this.props
    return (
      <Label error={meta.error}>
        <LabelText> {label} </LabelText>
        {meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>}
        <Input
          {...props}
          name={input.name}
          error={meta.touched && meta.error}
          placeholder={placeholder}
          readOnly
          mb={6}
        />
      </Label>
    )
  }

  render() {
    const { shouldShowDay, input } = this.props

    return (
      <Datetime
        onChange={input.onChange}
        value={input.value}
        timeFormat={false}
        isValidDate={shouldShowDay}
        locale="en-GB"
        dateFormat="DD/MM/YYYY"
        closeOnSelect
        strictParsing
        renderInput={this.renderInput}
      />
    )
  }
}

FormDatePicker.propTypes = {
  shouldShowDay: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }),
  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)]),
  }).isRequired,
}

FormDatePicker.defaultProps = {
  placeholder: '',
  label: '',
  meta: {},
}

export default FormDatePicker
