import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import FormDatePicker from './FormDatePicker'

class WhereaboutsDatePicker extends Component {
  daysToShow = (date) => date.isBefore(moment().add(7, 'days').endOf('day'))

  render() {
    const { handleDateChange, date, shouldShowDay, marginBottom } = this.props

    return (
      <FormDatePicker
        name="search-date"
        input={{ onChange: handleDateChange, value: date, name: 'search-date' }}
        label="Date"
        placeholder="Select"
        shouldShowDay={shouldShowDay || this.daysToShow}
        marginBottom={marginBottom}
      />
    )
  }
}

WhereaboutsDatePicker.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  shouldShowDay: PropTypes.func,
  marginBottom: PropTypes.number,
}

WhereaboutsDatePicker.defaultProps = {
  shouldShowDay: undefined,
  marginBottom: 6,
}

export default WhereaboutsDatePicker
