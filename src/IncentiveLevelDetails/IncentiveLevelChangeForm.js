import React from 'react'
import PropTypes from 'prop-types'
import Fieldset from '@govuk-react/fieldset'
import Button from '@govuk-react/button'
import TextArea from '@govuk-react/text-area'
import { connect } from 'react-redux'
import { Form } from 'react-final-form'
import { FORM_ERROR } from 'final-form'
import ErrorSummary from '@govuk-react/error-summary'
import RadioGroup from '../Components/RadioGroup'
import { ButtonContainer, ButtonCancel } from '../Components/Buttons'
import { FieldWithError, onHandleErrorClick } from '../final-form-govuk-helpers'

const validateThenSubmit = submitHandler => values => {
  const formErrors = []

  if (!values.reason) {
    formErrors.push({ targetName: 'reason', text: 'Enter reason for Incentive Level change' })
  }

  if (values.reason && values.reason.length > 240) {
    formErrors.push({ targetName: 'reason', text: 'Reason must be 240 characters or less' })
  }

  if (!values.level) {
    formErrors.push({ targetName: 'level', text: 'Select a level' })
  }

  if (formErrors.length > 0) return { [FORM_ERROR]: formErrors }

  return submitHandler(values)
}

export function IncentiveLevelChangeForm({ levels, cancelHandler, changeIepLevel }) {
  return (
    <Form
      onSubmit={values => validateThenSubmit(changeIepLevel)(values)}
      render={({ handleSubmit, submitting, pristine, submitError: errors }) => (
        <form onSubmit={handleSubmit} className="margin-top">
          {errors && (
            <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={errors} />
          )}
          <Fieldset>
            <Fieldset.Legend>Select new level</Fieldset.Legend>
            <FieldWithError name="level" errors={errors} component={RadioGroup} options={levels} inline />
            <FieldWithError
              errors={errors}
              name="reason"
              component={TextArea}
              className="width70"
              hint="Maximum 240 characters"
            >
              Reason for change
            </FieldWithError>
          </Fieldset>
          <ButtonContainer>
            <Button type="submit" disabled={submitting || pristine} mb={0}>
              Confirm change
            </Button>
            <ButtonCancel mb={0} onClick={cancelHandler} type="button">
              Cancel
            </ButtonCancel>
          </ButtonContainer>
        </form>
      )}
    />
  )
}

IncentiveLevelChangeForm.defaultProps = {
  levels: [],
}

IncentiveLevelChangeForm.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
  changeIepLevel: PropTypes.func.isRequired,
  // mapStateToProps
  levels: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
}

export default connect()(IncentiveLevelChangeForm)
