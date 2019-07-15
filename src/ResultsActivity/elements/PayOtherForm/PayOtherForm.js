import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Form } from 'react-final-form'
import { FORM_ERROR } from 'final-form'

import Select from '@govuk-react/select'
import TextArea from '@govuk-react/text-area'
import Button from '@govuk-react/button'
import Fieldset from '@govuk-react/fieldset'
import ErrorSummary from '@govuk-react/error-summary'
import { spacing } from '@govuk-react/lib'

import ButtonCancel from '../ButtonCancel'
import RadioGroup from '../../../Components/RadioGroup'
import { properCaseName } from '../../../utils'
import { FieldWithError, WhenFieldChanges, onHandleErrorClick } from '../../../final-form-govuk-helpers'

const ButtonContainer = styled.div`
  button {
    ${spacing.responsiveMargin({ size: 3, direction: 'right' })};
  }
`

const commentOrCaseNote = value => {
  if (value === 'UnacceptableAbsence' || value === 'Refused') return 'case note'
  return 'comments'
}

const validateThenSubmit = submitHandler => values => {
  const formErrors = []

  if (!values.pay) {
    formErrors.push({ targetName: 'pay', text: 'Select a pay option' })
  }

  if (!values.absentReason) {
    formErrors.push({ targetName: 'absentReason', text: 'Select a reason' })
  }

  if (!values.comments) {
    formErrors.push({ targetName: 'comments', text: `Enter ${commentOrCaseNote(values.absentReason)}` })
  }

  if (formErrors.length > 0) return { [FORM_ERROR]: formErrors }

  return submitHandler(values)
}

export function PayOtherForm({ cancelHandler, offender, updateOffenderAttendance, absentReasons }) {
  const { offenderNo, bookingId, eventId, eventLocationId, attendanceInfo } = offender
  const { id, absentReason, comments } = attendanceInfo || {}

  const payOffender = async values => {
    const paid = values.pay === 'yes'
    const reasons = [...absentReasons.paidReasons, ...absentReasons.unpaidReasons]

    const attendanceDetails = {
      id,
      offenderNo,
      bookingId,
      paid,
      eventId,
      eventLocationId,
      absentReason: reasons.find(ar => ar.value === values.absentReason),
      comments: values.comments,
      attended: false,
    }

    await updateOffenderAttendance(attendanceDetails, offender.offenderIndex)
  }

  const getAbsentReasons = pay => {
    if (!pay) return []
    return pay === 'yes' ? absentReasons.paidReasons : absentReasons.unpaidReasons
  }

  const getPreviousPayStatus = () => {
    if (id) return attendanceInfo.paid ? 'yes' : 'no'
    return undefined
  }

  const initialValues = {
    pay: getPreviousPayStatus(),
    absentReason: absentReason && absentReason.value,
    comments,
  }

  return (
    <Form
      initialValues={initialValues}
      onSubmit={values => validateThenSubmit(payOffender)(values)}
      render={({ handleSubmit, submitting, pristine, submitError: errors, values }) => (
        <form onSubmit={handleSubmit}>
          {errors && (
            <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={errors} />
          )}
          <WhenFieldChanges field="pay" becomes={values.pay || ''} set="absentReason" to="" />
          <Fieldset>
            <Fieldset.Legend size="MEDIUM" isPageHeading>
              Do you want to pay {properCaseName(offender.firstName)} {properCaseName(offender.lastName)}?
            </Fieldset.Legend>
            <FieldWithError
              name="pay"
              errors={errors}
              component={RadioGroup}
              options={[{ title: 'Yes', value: 'yes' }, { title: 'No', value: 'no' }]}
              inline
            />
            <FieldWithError errors={errors} name="absentReason" component={Select} label="Select a reason">
              <option value="" disabled>
                Select
              </option>
              {getAbsentReasons(values.pay).map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.name}
                </option>
              ))}
            </FieldWithError>
            <FieldWithError errors={errors} name="comments" component={TextArea}>
              Enter {commentOrCaseNote(values.absentReason)}
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
  )
}

PayOtherForm.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
  absentReasons: PropTypes.shape({
    paidReasons: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, name: PropTypes.string })).isRequired,
    unpaidReasons: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, name: PropTypes.string })).isRequired,
  }).isRequired,
  offender: PropTypes.shape({ id: PropTypes.string, firstName: PropTypes.string, lastName: PropTypes.string })
    .isRequired,
  updateOffenderAttendance: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  absentReasons: state.events.absentReasons,
})

export default connect(mapStateToProps)(PayOtherForm)
