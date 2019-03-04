import Button from '@govuk-react/button'
import ErrorSummary from '@govuk-react/error-summary'
import ErrorText from '@govuk-react/error-text'
import axios from 'axios'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { Form } from 'react-final-form'
import { BLACK, GREY_3 } from 'govuk-colours'
import TimePicker from '../Components/TimePicker/TimePicker'
import { FieldWithError, onHandleErrorClick } from '../final-form-govuk-helpers'
import { appointmentType } from '../types'

import { validateThenSubmit, offenderStartTimeFieldName } from './AddAppointmentFormValidation'
import { ButtonContainer } from './AppointmentForm.styles'

export const FormFields = ({ errors, error, offenders, date, now }) => (
  <React.Fragment>
    {error && <ErrorText> {error} </ErrorText>}
    {errors && <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={errors} />}
    <table className="row-gutters">
      <thead>
        <tr>
          <th className="straight width5"> Prison no.</th>
          <th className="straight width5"> Last name </th>
          <th className="straight width5"> First name </th>
          <th className="straight width5"> Start time </th>
        </tr>
      </thead>
      <tbody>
        {offenders.map(row => (
          <tr className="row-gutters" key={[row.offenderNo].join('_')}>
            <td className="row-gutters">{row.offenderNo}</td>
            <td className="row-gutters">{row.lastName}</td>
            <td className="row-gutters">{row.firstName}</td>
            <td className="row-gutters">
              <FieldWithError
                errors={errors}
                name={offenderStartTimeFieldName({ offenderNo: row.offenderNo })}
                title="Start time"
                date={date}
                now={now}
                futureTimeOnly
                component={TimePicker}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </React.Fragment>
)

FormFields.propTypes = {
  now: PropTypes.instanceOf(moment).isRequired,
  date: PropTypes.string.isRequired,
  error: PropTypes.string,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      targetName: PropTypes.string,
      text: PropTypes.string,
    })
  ),
  offenders: PropTypes.arrayOf(PropTypes.shape(PropTypes.map)),
}

FormFields.defaultProps = {
  error: null,
  errors: null,
  offenders: [],
}

const submitAppointments = ({ onSuccess, onError, appointment }) => async offenders => {
  const request = {
    appointmentDefaults: {
      comment: appointment.comments,
      locationId: Number(appointment.location),
      appointmentType: appointment.appointmentType,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
    },
    appointments: offenders.map(offender => ({
      bookingId: offender.bookingId,
      startTime: offender.startTime,
    })),
  }

  try {
    await axios.post('/api/bulk-appointments', request)
    onSuccess(request.appointments)
  } catch (error) {
    onError(error)
  }
}

export const getInitialValues = ({ offenders, startTime }) =>
  offenders.reduce((acc, offender) => {
    const key = offenderStartTimeFieldName({ offenderNo: offender.offenderNo })
    if (!acc[key])
      return {
        ...acc,
        [key]: startTime,
      }
    return acc
  }, {})

const AddAppointmentForm = ({
  offenders,
  appointment,
  error,
  now,
  date,
  startTime,
  onError,
  onSuccess,
  resetErrors,
  onCancel,
}) =>
  offenders &&
  offenders.length > 0 && (
    <Form
      onSubmit={values => {
        resetErrors()
        return validateThenSubmit({
          offenders,
          endTime: appointment.endTime,
          onSubmitAppointment: submitAppointments({ onError, onSuccess, appointment }),
        })(values)
      }}
      initialValues={getInitialValues({ offenders, startTime })}
      render={({ handleSubmit, submitError, submitting }) => (
        <form onSubmit={handleSubmit}>
          <FormFields offenders={offenders} now={now} date={date} error={error} errors={submitError} />
          <ButtonContainer>
            <Button disabled={submitting || offenders.length === 0} type="submit">
              Add appointment
            </Button>
            <Button buttonColour={GREY_3} buttonTextColour={BLACK} onClick={e => onCancel(e)}>
              Cancel
            </Button>
          </ButtonContainer>
        </form>
      )}
    />
  )

AddAppointmentForm.propTypes = {
  offenders: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    })
  ).isRequired,
  error: PropTypes.string,
  now: PropTypes.instanceOf(moment).isRequired,
  startTime: PropTypes.string,
  date: PropTypes.string,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  appointment: appointmentType.isRequired,
  resetErrors: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

AddAppointmentForm.defaultProps = {
  error: '',
  startTime: null,
  date: null,
}

export default AddAppointmentForm
