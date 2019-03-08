import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Container, Info, Text } from './AppointmentDetails.styles'
import { DAY_MONTH_YEAR, MOMENT_DAY_OF_THE_WEEK, DATE_TIME_FORMAT_SPEC } from '../date-formats'

const DayOfTheWeek = dateTime => moment(dateTime, DATE_TIME_FORMAT_SPEC).format(MOMENT_DAY_OF_THE_WEEK)
const DayMonthYear = dateTime => moment(dateTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)
const Time = dateTime => moment(dateTime, DATE_TIME_FORMAT_SPEC).format('HH:mm')

const AppointmentDetails = ({ appointmentTypeDescription, locationDescription, startTime, endTime, comments }) => (
  <Container>
    <Info>
      <strong> Appointment type </strong>
      <Text> {appointmentTypeDescription} </Text>
    </Info>

    <Info>
      <strong> Appointment location </strong>
      <Text> {locationDescription} </Text>
    </Info>

    <Info>
      <strong> Date and time </strong>
      <Text>
        <div> {DayOfTheWeek(startTime)}</div>
        {`${DayMonthYear(startTime)} - ${Time(startTime)}`} {endTime && ` - ${Time(endTime)}`}
      </Text>
    </Info>

    {comments && (
      <Info>
        <strong> Comments </strong>
        <Text> {comments.length > 30 ? `${comments.substr(0, 30)}....` : comments} </Text>
      </Info>
    )}
  </Container>
)

AppointmentDetails.propTypes = {
  appointmentTypeDescription: PropTypes.string.isRequired,
  locationDescription: PropTypes.string.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string,
  comments: PropTypes.string,
}

AppointmentDetails.defaultProps = {
  comments: '',
  endTime: '',
}

export default AppointmentDetails
