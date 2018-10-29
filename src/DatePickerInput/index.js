import React from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import DatePicker from './datePicker'

const DatePickerInput = props => {
  const { additionalClassName, handleDateChange, value, inputId } = props
  return (
    <DatePicker
      inputProps={{
        placeholder: 'Today',
        className: `datePickerInput form-control ${additionalClassName}`,
      }}
      name="date"
      shouldShowDay={date => !date.isAfter(moment().startOf('day'))}
      title="Date"
      handleDateChange={handleDateChange}
      inputId={inputId}
      value={value}
    />
  )
}

DatePickerInput.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  inputId: PropTypes.string.isRequired,
  additionalClassName: PropTypes.string,
}

DatePickerInput.defaultProps = {
  additionalClassName: '',
}

export default DatePickerInput
