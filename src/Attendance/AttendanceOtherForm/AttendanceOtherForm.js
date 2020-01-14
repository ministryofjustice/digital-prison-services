import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import { FORM_ERROR } from 'final-form'

import Select from '@govuk-react/select'
import TextArea from '@govuk-react/text-area'
import Button from '@govuk-react/button'
import Fieldset from '@govuk-react/fieldset'
import ErrorSummary from '@govuk-react/error-summary'

import { ButtonContainer, ButtonCancel } from '../../Components/Buttons'
import RadioGroup from '../../Components/RadioGroup'
import { properCaseName } from '../../utils'
import { FieldWithError, WhenFieldChanges, onHandleErrorClick } from '../../final-form-govuk-helpers'
import IncentiveLevelCreated from '../../IncentiveLevelCreated'
import { userType } from '../../types'

export function AttendanceOtherForm({
  user,
  offender,
  updateOffenderAttendance,
  absentReasons,
  absentReasons: { triggersIEPWarning },
  showModal,
  activityName,
  resetErrorDispatch,
  setErrorDispatch,
  reloadPage,
  raiseAnalyticsEvent,
  handleError,
  setOffenderAttendance,
  setSelectedOption,
  agencyId,
  period,
  date,
}) {
  const { offenderNo, bookingId, eventId, eventLocationId, attendanceInfo } = offender
  const { id, absentReason, comments } = attendanceInfo || {}
  const shouldTriggerIEP = selectedReason => triggersIEPWarning && triggersIEPWarning.includes(selectedReason)
  const commentOrCaseNote = selectedReason => (shouldTriggerIEP(selectedReason) ? 'case note' : 'comment')

  const validateThenSubmit = submitHandler => async values => {
    const formErrors = []
    const commentText = values.comments && values.comments.trim()

    if (!values.pay) {
      formErrors.push({ targetName: 'pay', text: 'Select a pay option' })
    }

    if (!values.absentReason) {
      formErrors.push({ targetName: 'absentReason', text: 'Select a reason' })
    }

    if (!commentText) {
      formErrors.push({ targetName: 'comments', text: `Enter ${commentOrCaseNote(values.absentReason)}` })
    }

    if (commentText && commentText.length < 2) {
      formErrors.push({ targetName: 'comments', text: `Enter a valid ${commentOrCaseNote(values.absentReason)}` })
    }

    if (commentText && commentText.length > 240) {
      formErrors.push({ targetName: 'comments', text: 'Maximum length should not exceed 240 characters' })
    }

    if (formErrors.length > 0) return { [FORM_ERROR]: formErrors }

    const attendanceUpdated = await submitHandler(values)

    if (attendanceUpdated && shouldTriggerIEP(values.absentReason)) {
      showModal(
        true,
        <IncentiveLevelCreated
          showModal={showModal}
          offender={offender}
          iepValues={values}
          activityName={activityName}
          user={user}
        />
      )
    }

    return attendanceUpdated
  }

  const payOffender = values => {
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

    return updateOffenderAttendance(
      attendanceDetails,
      offender.offenderIndex,
      agencyId,
      period,
      date,
      setOffenderAttendance,
      handleError,
      showModal,
      resetErrorDispatch,
      setErrorDispatch,
      setSelectedOption,
      raiseAnalyticsEvent,
      reloadPage
    )
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

  const cancelHandler = () => showModal(false)

  return (
    <Form
      initialValues={initialValues}
      onSubmit={values => validateThenSubmit(payOffender, showModal)(values)}
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
            <Button name="confirm" type="submit" disabled={submitting || pristine} mb={0}>
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

AttendanceOtherForm.propTypes = {
  // mapStateToProps
  user: userType.isRequired,
  absentReasons: PropTypes.shape({
    paidReasons: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, name: PropTypes.string })).isRequired,
    unpaidReasons: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, name: PropTypes.string })).isRequired,
    triggersIEPWarning: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,

  // props
  offender: PropTypes.shape({
    offenderIndex: PropTypes.number,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    bookingId: PropTypes.string,
    offenderNo: PropTypes.string,
    eventId: PropTypes.string,
    eventLocationId: PropTypes.string,
    attendanceInfo: PropTypes.shape({
      paid: PropTypes.bool,
      absentReason: PropTypes.string,
      id: PropTypes.number,
      comments: PropTypes.string,
    }),
  }).isRequired,
  updateOffenderAttendance: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  activityName: PropTypes.string.isRequired,
  agencyId: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  setOffenderAttendance: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setErrorDispatch: PropTypes.func.isRequired,
  reloadPage: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
  setSelectedOption: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  user: state.app.user,
  absentReasons: state.events.absentReasons,
})

export default connect(mapStateToProps)(AttendanceOtherForm)
