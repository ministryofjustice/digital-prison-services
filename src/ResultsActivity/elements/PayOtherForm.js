import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Form } from 'react-final-form'
import { FORM_ERROR } from 'final-form'
import axios from 'axios'

import Select from '@govuk-react/select'
import TextArea from '@govuk-react/text-area'
import Button from '@govuk-react/button'
import Fieldset from '@govuk-react/fieldset'
import ErrorSummary from '@govuk-react/error-summary'
import LoadingBox from '@govuk-react/loading-box'
import { spacing } from '@govuk-react/lib'

import ButtonCancel from './ButtonCancel'
import OffenderName from '../../OffenderName'
import RadioGroup from '../../Components/RadioGroup'
import { FieldWithError, onHandleErrorClick } from '../../final-form-govuk-helpers'

const ButtonContainer = styled.div`
  button {
    ${spacing.responsiveMargin({ size: 3, direction: 'right' })};
  }
`

const commentOrCaseNote = value => {
  if (value === 'UnacceptableAbsence' || value === 'Refused') return 'case note'
  return 'comment'
}

const validateThenSubmit = submitHandler => values => {
  const formErrors = []

  if (!values.pay) {
    formErrors.push({ targetName: 'pay', text: 'Select a pay option' })
  }

  if (!values.reason) {
    formErrors.push({ targetName: 'reason', text: 'Select a reason' })
  }

  if (!values.comment) {
    formErrors.push({ targetName: 'comment', text: `Enter a ${commentOrCaseNote(values.reason)}` })
  }

  if (formErrors.length > 0) return { [FORM_ERROR]: formErrors }

  return submitHandler(values)
}

function PayOtherForm({ cancelHandler, offender, updateOffenderAttendance, handleError }) {
  const [absenceReasons, setAbsenceReasons] = useState([])

  useEffect(() => {
    // Move into reducer
    const getAbsenceReasons = async () => {
      try {
        const response = await axios.get(`/api/attendance/absence-reasons`)
        setAbsenceReasons(response.data)
      } catch (error) {
        handleError(error)
        cancelHandler()
      }
    }

    getAbsenceReasons()
  }, [])

  const payOffender = async values => {
    const paid = values.pay === 'yes'

    const attendanceDetails = {
      absentReason: values.reason,
      comment: values.comment,
      offenderNo: offender.id,
      attended: false,
      paid,
      eventId: offender.eventId,
      eventLocationId: offender.eventLocationId,
    }

    await updateOffenderAttendance(attendanceDetails, offender.offenderIndex)
  }

  return (
    <LoadingBox loading={!absenceReasons.length}>
      <Form
        onSubmit={values => validateThenSubmit(payOffender)(values)}
        render={({ handleSubmit, submitting, pristine, submitError: errors, values }) => (
          <form onSubmit={handleSubmit}>
            {errors && (
              <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={errors} />
            )}
            <Fieldset>
              <Fieldset.Legend size="LARGE" isPageHeading>
                Do you want to pay <OffenderName firstName={offender.firstName} lastName={offender.lastName} />?
              </Fieldset.Legend>
              <FieldWithError
                name="pay"
                errors={errors}
                component={RadioGroup}
                options={[{ title: 'Yes', value: 'yes' }, { title: 'No', value: 'no' }]}
                inline
              />
              <FieldWithError errors={errors} name="reason" component={Select} label="Select a reason">
                <option value="" disabled hidden>
                  Select
                </option>
                {absenceReasons.map(reason => (
                  <option key={reason.value} value={reason.value}>
                    {reason.name}
                  </option>
                ))}
              </FieldWithError>
              <FieldWithError errors={errors} name="comment" component={TextArea}>
                Enter a {commentOrCaseNote(values.reason)}
              </FieldWithError>
            </Fieldset>
            <ButtonContainer>
              <Button type="submit" disabled={submitting || pristine} mb={0}>
                Confirm
              </Button>
              <ButtonCancel mb={0} onClick={cancelHandler} type="button">
                Cancel
              </ButtonCancel>
            </ButtonContainer>
          </form>
        )}
      />
    </LoadingBox>
  )
}

PayOtherForm.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
  offender: PropTypes.shape({ id: PropTypes.string, firstName: PropTypes.string, lastName: PropTypes.string })
    .isRequired,
  updateOffenderAttendance: PropTypes.func.isRequired,
}

export default PayOtherForm
