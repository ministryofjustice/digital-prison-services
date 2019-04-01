import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import FormDatePicker from './FormDatePicker'

class WhereaboutsDatePicker extends Component {
  daysToShow = date => {
    let daysInAdvance = 2

    // If Friday, show Monday
    if (moment().isoWeekday() === 5) daysInAdvance = 4

    return date.isBefore(
      moment()
        .add(daysInAdvance, 'days')
        .startOf('day')
    )
  }

  render() {
    const { handleDateChange, date } = this.props

    return (
      <FormDatePicker
        name="search-date"
        input={{ onChange: handleDateChange, value: date, name: 'search-date' }}
        label="Date"
        placeholder="Select"
        shouldShowDay={this.daysToShow}
      />
    )
  }
}

WhereaboutsDatePicker.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
}

export default WhereaboutsDatePicker
