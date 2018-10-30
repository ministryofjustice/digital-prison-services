import React, { Component } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import PropTypes from 'prop-types'

class DatePicker extends Component {
  constructor() {
    super()
    this.renderInput = this.renderInput.bind(this)
  }

  renderInput(props) {
    const { inputId, name } = this.props
    return (
      <div>
        <input id={inputId} name={name} {...props} readOnly />
      </div>
    )
  }

  render() {
    const { shouldShowDay, handleDateChange } = this.props

    return (
      <Datetime
        className=""
        onChange={handleDateChange}
        timeFormat={false}
        isValidDate={shouldShowDay}
        locale="en-GB"
        dateFormat="DD/MM/YYYY"
        closeOnSelect
        strictParsing
        {...this.props}
        renderInput={this.renderInput}
      />
    )
  }
}

DatePicker.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  shouldShowDay: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  inputId: PropTypes.string.isRequired,
  value: PropTypes.string,
  inputProps: PropTypes.shape({ placeholder: PropTypes.string.isRequired, className: PropTypes.string.isRequired })
    .isRequired,
}

DatePicker.defaultProps = {
  value: '',
}

export default DatePicker
