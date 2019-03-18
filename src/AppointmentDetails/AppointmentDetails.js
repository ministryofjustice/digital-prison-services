import React from 'react'
import PropTypes from 'prop-types'
import { Container, Info, Text } from './AppointmentDetails.styles'
import { DayOfTheWeek, DayMonthYear, Time } from '../dateHelpers'
import { properCaseName } from '../utils'
import RecurringAppointments from '../BulkAppointments/RecurringAppointments'

const AppointmentDetails = ({
  appointmentTypeDescription,
  locationDescription,
  startTime,
  endTime,
  comments,
  recurring,
  repeats,
  times,
}) => (
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
        <Text> {comments.length > 15 ? `${comments.substr(0, 15)}...` : comments} </Text>
      </Info>
    )}

    {recurring && (
      <Info>
        <strong> Recurring </strong>
        <Text>
          {properCaseName(repeats)}, repeats {times} times
        </Text>
        <Text> Ends {RecurringAppointments.recurringEndDate({ startTime, repeats, numberOfTimes: times })}</Text>
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
  recurring: PropTypes.bool,
  repeats: PropTypes.string,
  times: PropTypes.string,
}

AppointmentDetails.defaultProps = {
  comments: '',
  endTime: '',
  recurring: false,
  repeats: '',
  times: '',
}

export default AppointmentDetails
