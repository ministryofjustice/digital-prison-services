import React, { Component } from 'react';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import PropTypes from 'prop-types';

class DatePicker extends Component {
  constructor () {
    super();
    this.renderInput = this.renderInput.bind(this);
  }

  renderInput (props) {
    const { inputId, className, name } = this.props;
    return (
      <div>
        <input id={inputId} className={className} name={name} {...props} readOnly/>
      </div>
    );
  }

  render () {
    const { shouldShowDay, handleDateChange } = this.props;

    return (

      <Datetime
        className=""
        onChange={handleDateChange}
        timeFormat={false}
        isValidDate={shouldShowDay}
        locale="en-GB"
        dateFormat={"DD/MM/YYYY"}
        closeOnSelect
        strictParsing
        {...this.props}
        renderInput={this.renderInput}
      />);
  }
}


DatePicker.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  shouldShowDay: PropTypes.func.isRequired,
  className: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  inputId: PropTypes.string
};

export default DatePicker;
