import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Fieldset from '@govuk-react/fieldset'
import Button from '@govuk-react/button'
import TextArea from '@govuk-react/text-area'
import Select from '@govuk-react/select'
import Link from '@govuk-react/link'

import { connect } from 'react-redux'
import { Form } from 'react-final-form'
import { FORM_ERROR } from 'final-form'
import ErrorSummary from '@govuk-react/error-summary'
import styled from 'styled-components'
import moment from 'moment'

import { linkOnClick } from '../helpers'
import { ButtonContainer, ButtonCancel } from '../Components/Buttons'
import { FieldWithError, onHandleErrorClick, WhenFieldChanges } from '../final-form-govuk-helpers'
import FormDatePicker from '../DatePickers/FormDatePicker'
import { DATE_ONLY_FORMAT_SPEC } from '../dateHelpers'
import FormattedDate from '../DateFormatter'

const DateLinkContainer = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 50%;
`

export const validateThenSubmit = submitHandler => values => {
  const formErrors = []

  if (!values.alertType) {
    formErrors.push({ targetName: 'alertType', text: 'Select a type of alert' })
  }

  if (!values.alertSubType) {
    formErrors.push({ targetName: 'alertSubType', text: 'Select an alert' })
  }

  if (!values.comment) {
    formErrors.push({ targetName: 'comment', text: 'Comment required' })
  }

  if (values.comment && values.comment.length > 1000) {
    formErrors.push({ targetName: 'comment', text: 'Enter a comment using 1000 characters or less' })
  }

  if (!values.effectiveDate) {
    formErrors.push({ targetName: 'effectiveDate', text: 'Select an effective date' })
  }

  if (formErrors.length > 0) return { [FORM_ERROR]: formErrors }

  return submitHandler(values)
}
export class CreateAlertForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editDate: false,
    }
  }

  render() {
    const {
      alertTypes,
      alertSubTypes,
      cancelHandler,
      handleSubmit,
      errors,
      submitting,
      pristine,
      selectedAlertType,
      effectiveDate,
    } = this.props

    const { editDate } = this.state

    return (
      <form onSubmit={handleSubmit} className="margin-top">
        {Boolean(errors && errors.length) && (
          <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={errors} />
        )}

        <WhenFieldChanges field="alertType" becomes={selectedAlertType} set="alertSubType" to={undefined} />

        <Fieldset>
          <Fieldset.Legend>Type of alert</Fieldset.Legend>
          <FieldWithError errors={errors} name="alertType" component={Select}>
            <option value="" disabled hidden>
              Select
            </option>
            {alertTypes.map(type => (
              <option key={`alert_type_${type.value}`} value={type.value}>
                {type.description}
              </option>
            ))}
          </FieldWithError>
        </Fieldset>

        <Fieldset>
          <Fieldset.Legend>Alert</Fieldset.Legend>
          <FieldWithError errors={errors} name="alertSubType" component={Select}>
            <option value="" disabled hidden>
              Select
            </option>
            {alertSubTypes.filter(sub => sub.parentValue === selectedAlertType).map(type => (
              <option key={`alert_sub_type_${type.value}`} value={type.value}>
                {type.description}
              </option>
            ))}
          </FieldWithError>
        </Fieldset>

        <Fieldset>
          <Fieldset.Legend>Comment</Fieldset.Legend>
          <FieldWithError name="comment" errors={errors} component={TextArea} />
        </Fieldset>

        <Fieldset>
          <Fieldset.Legend>Effective date</Fieldset.Legend>
          <DateLinkContainer>
            {!editDate && <FormattedDate isoDate={effectiveDate} />}
            {editDate && (
              <FieldWithError
                name="effectiveDate"
                errors={errors}
                component={FormDatePicker}
                placeholder="Select"
                shouldShowDay={date => {
                  const now = moment()
                  const sevenDaysAgo = moment().subtract(7, 'day')
                  const dateToCheck = moment(date, DATE_ONLY_FORMAT_SPEC)

                  return dateToCheck.isSameOrBefore(now, 'date') && dateToCheck.isSameOrAfter(sevenDaysAgo, 'date')
                }}
              />
            )}
            {!editDate && (
              <Link
                data-qa="edit-date-link"
                className="link clickable"
                {...linkOnClick(() =>
                  this.setState(state => ({
                    ...state,
                    editDate: true,
                  }))
                )}
              >
                Change
              </Link>
            )}
          </DateLinkContainer>
        </Fieldset>

        <ButtonContainer className="margin-top-30">
          <Button type="submit" disabled={submitting || pristine} mb={0}>
            Save and continue
          </Button>
          <ButtonCancel mb={0} onClick={cancelHandler} type="button">
            Cancel
          </ButtonCancel>
        </ButtonContainer>
      </form>
    )
  }
}

CreateAlertForm.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.arrayOf(PropTypes.shape({})),
  submitting: PropTypes.bool,
  pristine: PropTypes.bool,
  alertTypes: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  alertSubTypes: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      parentValue: PropTypes.string.isRequired,
    })
  ),
  selectedAlertType: PropTypes.string,
  effectiveDate: PropTypes.string,
}

CreateAlertForm.defaultProps = {
  submitting: false,
  pristine: false,
  alertTypes: [],
  alertSubTypes: [],
  errors: [],
  selectedAlertType: '',
  effectiveDate: '',
}

function CreateAlertFinalForm({ alertTypes, alertSubTypes, cancelHandler, createAlertHandler }) {
  return (
    <Form
      initialValues={{
        effectiveDate: moment(),
      }}
      onSubmit={values => validateThenSubmit(createAlertHandler)(values)}
      render={({ handleSubmit, submitting, pristine, submitError: errors, values }) => (
        <CreateAlertForm
          submitting={submitting}
          pristine={pristine}
          alertTypes={alertTypes}
          alertSubTypes={alertSubTypes}
          handleSubmit={handleSubmit}
          cancelHandler={cancelHandler}
          errors={errors}
          selectedAlertType={values.alertType}
          effectiveDate={values.effectiveDate}
        />
      )}
    />
  )
}

CreateAlertFinalForm.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
  createAlertHandler: PropTypes.func.isRequired,
  alertTypes: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  alertSubTypes: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      parentValue: PropTypes.string.isRequired,
    })
  ),
}

CreateAlertFinalForm.defaultProps = {
  alertTypes: [],
  alertSubTypes: [],
}

export default connect()(CreateAlertFinalForm)
