import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import createDecorator from 'final-form-calculate'

import Button from '@govuk-react/button'
import ErrorSummary from '@govuk-react/error-summary'
import ErrorText from '@govuk-react/error-text'
import Checkbox from '@govuk-react/checkbox'
import Label from '@govuk-react/label'
import LabelText from '@govuk-react/label-text'

import moment from 'moment'
import { GREY_3, BLACK } from 'govuk-colours'
import NumericInput from '../../Components/NumericInput/NumericInput'
import TimePicker from '../../Components/TimePicker/TimePicker'
import FormDatePicker from '../../DatePickerInput/formDatePicker'

import RecurringAppointments from '../RecurringAppointments'
import ValidateThenSubmit from './AppointmentDetailsFormValidation'

import {
  HorizontallyStacked,
  RightSection,
  Container,
  ButtonContainer,
  FullWidthTextArea,
  FullWidthSelect,
  Indent,
  AddSpacing,
} from '../AddPrisoners/AddPrisoners.styles'

import { FieldWithError, onHandleErrorClick } from '../../final-form-govuk-helpers'

const endDateCalculator = createDecorator({
  field: ['times', 'repeats', 'date', 'startTime'],
  updates: {
    recurringEndDate: (change, values) => RecurringAppointments.recurringEndDate(values),
  },
})
export const FormFields = ({ errors, values, appointmentTypes, locationTypes, now }) => (
  <React.Fragment>
    {errors && <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={errors} />}
    <Container>
      <div>
        <FieldWithError
          errors={errors}
          name="appointmentType"
          component={FullWidthSelect}
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
            component={FormDatePicker}
            label="Date"
            placeholder="Select"
            shouldShowDay={date =>
              date.isAfter(
                moment()
                  .subtract(1, 'days')
                  .startOf('day')
              )
            }
          />
          <FieldWithError
            date={values.date}
            futureTimeOnly
            errors={errors}
            name="startTime"
            now={now}
            component={TimePicker}
            label="Group start time"
          />
        </HorizontallyStacked>

        <FieldWithError
          name="recurring"
          type="checkbox"
          render={({ input }) => <Checkbox {...input}>This is a recurring appointment</Checkbox>}
        />

        {values.recurring && (
          <AddSpacing>
            <Indent>
              <FieldWithError
                errors={errors}
                name="repeats"
                component={FullWidthSelect}
                placeholder="Select"
                label="Repeats"
              >
                <option value="" disabled hidden>
                  Select
                </option>
                <option value="DAILY">Daily</option>
                <option value="WEEKDAYS">Weekdays (Monday to Friday)</option>
                <option value="WEEKLY">Weekly</option>
                <option value="FORTNIGHTLY">Fortnightly</option>
                <option value="MONTHLY">Monthly</option>
              </FieldWithError>

              <FieldWithError
                errors={errors}
                name="times"
                label="Occurrences"
                hint="Up to a maximum of 1 year"
                component={NumericInput}
              />

              {values.repeats &&
                values.times &&
                values.startTime &&
                values.recurringEndDate && (
                  <Label>
                    <LabelText> Ends on</LabelText>
                    <strong>{values.recurringEndDate}</strong>
                  </Label>
                )}
            </Indent>
          </AddSpacing>
        )}
      </div>

      <RightSection>
        <FieldWithError
          errors={errors}
          name="location"
          component={FullWidthSelect}
          placeholder="Select"
          label="Location"
        >
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
            <FullWidthTextArea
              input={{
                ...input,
                value: values.comments || input.value,
              }}
              {...meta}
            >
              Comments (optional)
            </FullWidthTextArea>
          )}
        />
      </RightSection>
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

const AppointmentDetailsForm = ({
  appointmentTypes,
  locationTypes,
  onSuccess,
  error,
  now,
  initialValues,
  onCancel,
}) => (
  <Form
    initialValues={initialValues}
    onSubmit={ValidateThenSubmit({ onSuccess, appointmentTypes, locationTypes })}
    decorators={[endDateCalculator]}
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
        <ButtonContainer>
          <Button type="submit" disabled={!initialValues && pristine}>
            Continue
          </Button>
          <Button buttonColour={GREY_3} buttonTextColour={BLACK} onClick={e => onCancel(e)}>
            Cancel
          </Button>
        </ButtonContainer>
      </form>
    )}
  />
)

AppointmentDetailsForm.propTypes = {
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
  onSuccess: PropTypes.func.isRequired,
  error: PropTypes.string,
  now: PropTypes.instanceOf(moment).isRequired,
  initialValues: PropTypes.shape(PropTypes.object),
  onCancel: PropTypes.func.isRequired,
}

AppointmentDetailsForm.defaultProps = {
  appointmentTypes: [],
  locationTypes: [],
  error: '',
  initialValues: {},
}

export default AppointmentDetailsForm
