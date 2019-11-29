import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import { FORM_ERROR } from 'final-form'

import TextArea from '@govuk-react/text-area'
import Button from '@govuk-react/button'
import Fieldset from '@govuk-react/fieldset'
import ErrorSummary from '@govuk-react/error-summary'

import { ButtonContainer, ButtonCancel } from '../../Components/Buttons'
import { FieldWithError, onHandleErrorClick } from '../../final-form-govuk-helpers'

const validateThenSubmit = submitHandler => values => {
  const formErrors = []
  const commentText = values.comments && values.comments.trim()

  if (!commentText) {
    formErrors.push({ targetName: 'comments', text: 'Enter comment' })
  }

  if (commentText && commentText.length < 2) {
    formErrors.push({ targetName: 'comments', text: 'Enter a valid comment' })
  }

  if (formErrors.length > 0) return { [FORM_ERROR]: formErrors }

  return submitHandler(values)
}

const AttendanceNotRequiredForm = ({ showModal, submitHandler }) => {
  const cancelHandler = () => showModal(false)

  return (
    <Form
      onSubmit={values => validateThenSubmit(submitHandler)(values)}
      render={({ handleSubmit, submitting, pristine, submitError: errors }) => (
        <form onSubmit={handleSubmit}>
          {errors && (
            <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={errors} />
          )}
          <Fieldset>
            <Fieldset.Legend size="MEDIUM" isPageHeading>
              Why are these prisoners not required?
            </Fieldset.Legend>
            <FieldWithError errors={errors} name="comments" component={TextArea} mb={6}>
              Enter comments
            </FieldWithError>
            <ButtonContainer>
              <Button name="confirm" type="submit" disabled={submitting || pristine} mb={0}>
                Confirm
              </Button>
              <ButtonCancel mb={0} onClick={cancelHandler} type="button">
                Cancel
              </ButtonCancel>
            </ButtonContainer>
          </Fieldset>
        </form>
      )}
    />
  )
}

AttendanceNotRequiredForm.propTypes = {
  showModal: PropTypes.func.isRequired,
  submitHandler: PropTypes.func.isRequired,
}

export default AttendanceNotRequiredForm
