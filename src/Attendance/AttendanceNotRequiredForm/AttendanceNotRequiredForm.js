import React from 'react'
import PropTypes from 'prop-types'
import { Form, Field } from 'react-final-form'

import TextArea from '@govuk-react/text-area'
import Button from '@govuk-react/button'
import Fieldset from '@govuk-react/fieldset'

import { ButtonContainer, ButtonCancel } from '../../Components/Buttons'

const AttendanceNotRequiredForm = ({ showModal, submitHandler }) => {
  const cancelHandler = () => showModal(false)

  return (
    <Form
      onSubmit={values => submitHandler(values)}
      render={({ handleSubmit, submitting, pristine }) => (
        <form onSubmit={handleSubmit}>
          <Fieldset>
            <Fieldset.Legend size="MEDIUM" isPageHeading>
              Why are these prisoners not required?
            </Fieldset.Legend>
            <Field name="comments" mb={6} component={TextArea}>
              Enter comments
            </Field>
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
