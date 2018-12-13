import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DateField from '@govuk-react/date-field'
import moment from 'moment'

class DateOfBirthInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dateIsValid: false,
      dateIsInThePast: true,
      blank: true,
    }
    this.dateRef = React.createRef()
    this.onChange = this.onChange.bind(this)
    this.errorText = this.errorText.bind(this)
  }

  componentDidMount() {
    this.onChange({})
  }

  onChange = value => {
    const { handleDateOfBirthChange } = this.props
    // value only holds the current input value, so need to copy all over and then replace
    const {
      day: { value: dayRefValue },
      month: { value: monthRefValue },
      year: { value: yearRefValue },
    } = this.dateRef.current.inputs
    const { day = dayRefValue, month = monthRefValue, year = yearRefValue } = value

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
    const dateIsTooEarly = dateIsValid ? date.isBefore(DateOfBirthInput.EARLIEST_DATE) : true
    const blank = !day && !month && !year

    this.setState({
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
    return (
      <DateField input={{ ref: this.dateRef, onChange: this.onChange }} errorText={this.errorText()}>
        Date of birth
      </DateField>
    )
  }
}

DateOfBirthInput.EARLIEST_DATE = moment({ day: 1, month: 0, year: 1900 })

DateOfBirthInput.propTypes = {
  // props
  showErrors: PropTypes.bool,
  // This component calls handleDateOfBirthChange with an object like { isoDate: '2018-10-25', valid: true, blank: false }
  handleDateOfBirthChange: PropTypes.func,
}

DateOfBirthInput.defaultProps = {
  showErrors: false,
  handleDateOfBirthChange: undefined,
}

export default DateOfBirthInput
