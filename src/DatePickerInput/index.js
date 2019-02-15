import React from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import DatePicker from './datePicker'

const futureDateOnly = date =>
  date.isAfter(
    moment()
      .subtract(1, 'days')
      .startOf('day')
  )

const pastDateOnly = date =>
  date.isBefore(
    moment()
      .add(1, 'days')
      .startOf('day')
  )

const DatePickerInput = props => {
  const { additionalClassName, handleDateChange, label, value, inputId, error, futureOnly, placeholder } = props

  const validDate = futureOnly ? futureDateOnly : pastDateOnly

  return (
    <DatePicker
      inputProps={{
        placeholder,
        className: `datePickerInput form-control ${additionalClassName}`,
        label,
        error,
      }}
      name="date"
      shouldShowDay={validDate}
      title="Date"
      handleDateChange={handleDateChange}
      inputId={inputId}
      value={value}
    />
  )
}

DatePickerInput.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  inputId: PropTypes.string.isRequired,
  additionalClassName: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  futureOnly: PropTypes.bool,
  placeholder: PropTypes.string,
}

DatePickerInput.defaultProps = {
  additionalClassName: '',
  label: '',
  error: '',
  value: '',
  futureOnly: false,
  placeholder: 'Today',
}

export default DatePickerInput
