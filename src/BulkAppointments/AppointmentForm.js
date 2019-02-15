import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import { FORM_ERROR } from 'final-form'

import Select from '@govuk-react/select'
import TextArea from '@govuk-react/text-area'
import Button from '@govuk-react/button'
import ErrorSummary from '@govuk-react/error-summary'
import LabelText from '@govuk-react/label-text'
import Label from '@govuk-react/label'
import ErrorText from '@govuk-react/error-text'

import moment from 'moment'

import TimePicker from '../Components/TimePicker/TimePicker'
import DatePicker from '../DatePickerInput'

import { HorizontallyStacked, Section, Container } from './AppointmentForm.styles'

import FieldWithError from '../final-form-govuk-helpers'

const onHandleErrorClick = targetName => {
  document.getElementsByName(targetName)[0].scrollIntoView()
}

export const onSubmit = onSucces => values => {
  const formErrors = []
  const now = moment()
  const isToday = values.date ? values.date.isSame(now, 'day') : false

  if (values.comments && values.comments.length > 3600) {
    formErrors.push({ targetName: 'comments', text: 'Maximum length should not exceed 3600 characters' })
  }

  if (!values.appointmentType) {
    formErrors.push({ targetName: 'appointmentType', text: 'Select appointment type' })
  }

  if (!values.location) {
    formErrors.push({ targetName: 'location', text: 'Select location' })
  }

  if (!values.date) {
    formErrors.push({ targetName: 'date', text: 'Date is required' })
  }

  if (isToday && moment(values.startTime).isBefore(now)) {
    formErrors.push({ targetName: 'startTime', text: 'The start time must not be in the past' })
  }

  if (isToday && moment(values.endTime).isBefore(now)) {
    formErrors.push({ targetName: 'endTime', text: 'The end time must be in the future' })
  }

  if (values.startTime && values.endTime) {
    const DATE_TIME_FORMAT_SPEC = 'YYYY-MM-DDTHH:mm:ss'

    const endNotAfterStart = !moment(values.endTime, DATE_TIME_FORMAT_SPEC).isAfter(
      moment(values.startTime, DATE_TIME_FORMAT_SPEC),
      'minute'
    )

    if (endNotAfterStart) {
      formErrors.push({ targetName: 'startTime', text: 'The start time must be before the end time' })
      formErrors.push({ targetName: 'endTime', text: 'The end time must be after the start time' })
    }
  }

  if (formErrors.length > 0) return { [FORM_ERROR]: formErrors }

  return onSucces(values)
}

export const FormFields = ({ errors, values, appointmentTypes, locationTypes, now }) => (
  <React.Fragment>
    {errors && <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={errors} />}
    <Container>
      <Section>
        <FieldWithError
          errors={errors}
          name="appointmentType"
          component={Select}
          placeholder="Select"
          label="Appointment type"
        >
          <option value="" disabled hidden>
            Select
          </option>
          {appointmentTypes.map(type => (
            <option key={`app${type.id}`} value={type.id}>
              {type.description}
            </option>
          ))}
        </FieldWithError>
        <HorizontallyStacked>
          <FieldWithError
            name="date"
            errors={errors}
            render={({ input, meta }) => (
              <Label error={meta.error}>
                <LabelText> Select date </LabelText>
                {meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>}
                <DatePicker
                  placeholder="Select"
                  futureOnly
                  inputId="date"
                  title="date"
                  error={String(meta.touched && meta.error)}
                  handleDateChange={input.onChange}
                />
              </Label>
            )}
          />
          <FieldWithError
            date={values.date}
            futureTimeOnly
            errors={errors}
            name="startTime"
            now={now}
            component={TimePicker}
            label="Group start time (optional)"
          />
        </HorizontallyStacked>
      </Section>

      <Section>
        <FieldWithError errors={errors} name="location" component={Select} placeholder="Select" label="Location">
          <option value="" disabled hidden>
            Select
          </option>
          {locationTypes.map(type => (
            <option key={`loc${type.id}`} value={type.id}>
              {type.description}
            </option>
          ))}
        </FieldWithError>
        <FieldWithError
          date={values.date}
          futureTimeOnly
          errors={errors}
          name="endTime"
          now={now}
          component={TimePicker}
          label="Group end time (optional)"
        />
        <FieldWithError
          errors={errors}
          name="comments"
          render={({ input, meta }) => (
            <TextArea {...input} {...meta}>
              Comments (optional)
            </TextArea>
          )}
        />
      </Section>
    </Container>
  </React.Fragment>
)

FormFields.propTypes = {
  appointmentTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      description: PropTypes.string,
    })
  ),
  locationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      description: PropTypes.string,
    })
  ),
  now: PropTypes.instanceOf(moment).isRequired,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      targetName: PropTypes.string,
      text: PropTypes.string,
    })
  ),
  values: PropTypes.shape(PropTypes.map),
}

FormFields.defaultProps = {
  errors: null,
  locationTypes: [],
  appointmentTypes: [],
  values: {},
}

const AppointmentForm = ({ appointmentTypes, locationTypes, trySubmit, error, now, initialValues }) => (
  <Form
    initialValues={initialValues}
    onSubmit={onSubmit(trySubmit)}
    render={({ handleSubmit, pristine, submitError, values }) => (
      <form onSubmit={handleSubmit}>
        {error && <ErrorText> {error} </ErrorText>}
        <FormFields
          now={now}
          errors={submitError}
          values={values}
          appointmentTypes={appointmentTypes}
          locationTypes={locationTypes}
        />

        <Button type="submit" disabled={pristine}>
          Continue
        </Button>
      </form>
    )}
  />
)

AppointmentForm.propTypes = {
  appointmentTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      description: PropTypes.string,
    })
  ),
  locationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      description: PropTypes.string,
    })
  ),
  trySubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
  now: PropTypes.instanceOf(moment).isRequired,
  initialValues: PropTypes.shape(PropTypes.object),
}

AppointmentForm.defaultProps = {
  appointmentTypes: [],
  locationTypes: [],
  error: '',
  initialValues: null,
}

export default AppointmentForm
