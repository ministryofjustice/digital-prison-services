import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import DatePicker from "./datePicker";

const DatePickerInput = (props) => {
  const { additionalClassName, handleDateChange } = props;
  return (
    <DatePicker
      inputProps={{
        placeholder: "Today",
        className: `datePickerInput form-control ${additionalClassName}`
      }}
      name="date"
      shouldShowDay={date => !date.isAfter(moment().startOf("day"))}
      title="Date"
      handleDateChange={handleDateChange}
      {...props}
    />
  );
};

DatePickerInput.propTypes = {
  history: PropTypes.object,
  date: PropTypes.string,
  dateId: PropTypes.string,
  additionalClassName: PropTypes.string,
  handleDateChange: PropTypes.func.isRequired
};

export default DatePickerInput;
