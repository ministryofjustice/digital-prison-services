import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DateField from '@govuk-react/date-field'
import moment from 'moment'

class DateOfBirth extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: {},
      dateIsValid: false,
      dateIsInThePast: true,
      blank: true,
    }
    this.onChange = this.onChange.bind(this)
    this.errorText = this.errorText.bind(this)
  }

  componentDidMount() {
    this.onChange({})
  }

  onChange(value) {
    const { handleDateOfBirthChange } = this.props
    const { day, month, year } = value

    const d = Number.parseInt(day, 10)
    const m = Number.parseInt(month, 10)
    const y = Number.parseInt(year, 10)

    const date = moment({
      day: d,
      month: Number.isNaN(m) ? m : m - 1,
      year: y,
    })
    const dateIsValid = date.isValid() && !Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)
    const dateIsInThePast = dateIsValid ? date.isBefore(moment(), 'day') : false
    const dateIsTooEarly = dateIsValid ? date.isBefore(DateOfBirth.EARLIEST_DATE) : true
    const blank = !day && !month && !year

    this.setState({
      value,
      dateIsValid,
      dateIsInThePast,
      dateIsTooEarly,
      blank,
    })

    const valid = dateIsValid && dateIsInThePast && !dateIsTooEarly

    if (handleDateOfBirthChange !== undefined) {
      handleDateOfBirthChange({
        isoDate: valid ? date.format('YYYY-MM-DD') : undefined,
        valid,
        blank,
      })
    }
  }

  errorText() {
    const { showErrors } = this.props
    const { dateIsValid, dateIsInThePast, dateIsTooEarly, blank } = this.state
    if (!showErrors) return undefined
    if (blank) return undefined
    if (!dateIsValid) return 'Enter a real date of birth'
    if (!dateIsInThePast) return 'Date of birth must be in the past'
    if (dateIsTooEarly) return 'Date of birth must be after 1 January 1900'
    return undefined
  }

  render() {
    const { value } = this.state
    return (
      <DateField input={{ value, onChange: this.onChange }} errorText={this.errorText()}>
        Date of birth
      </DateField>
    )
  }
}

DateOfBirth.EARLIEST_DATE = moment({ day: 1, month: 0, year: 1900 })

DateOfBirth.propTypes = {
  // props
  showErrors: PropTypes.bool,
  // This component calls onChange with an object like { isoDate: '2018-10-25', valid: true }
  handleDateOfBirthChange: PropTypes.func,
}

DateOfBirth.defaultProps = {
  showErrors: false,
  handleDateOfBirthChange: undefined,
}

export default DateOfBirth
