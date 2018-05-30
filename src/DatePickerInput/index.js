import React, { Component } from 'react';
import DatePicker from './datePicker';
import moment from 'moment';
import PropTypes from 'prop-types';

class DatePickerInput extends Component {
  render () {
    return (<DatePicker
      inputProps={{ placeholder: 'Today', className: `datePickerInput form-control ${this.props.additionalClassName}` }}
      name="date"
      shouldShowDay={(date) => !date.isBefore(moment().startOf('day'))}
      title="Date" {...this.props}
      handleDateChange={this.props.handleDateChange}
    />);
  }
}

DatePickerInput.propTypes = {
  history: PropTypes.object,
  date: PropTypes.string,
  dateId: PropTypes.string,
  additionalClassName: PropTypes.string,
  handleDateChange: PropTypes.func.isRequired
};
export default DatePickerInput;
