/* eslint-disable react/prop-types */
import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Field, Form } from 'react-final-form'
import { FORM_ERROR } from 'final-form'

import Select from '@govuk-react/select'
import TextArea from '@govuk-react/text-area'
import Button from '@govuk-react/button'
import Fieldset from '@govuk-react/fieldset'
import ErrorSummary from '@govuk-react/error-summary'
import MultiChoice from '@govuk-react/multi-choice'
import Radio from '@govuk-react/radio'

import { ButtonContainer, ButtonCancel } from '../../Components/Buttons'
import RadioGroup from '../../Components/RadioGroup'
import { formatName } from '../../utils'
import { FieldWithError, WhenFieldChanges, onHandleErrorClick } from '../../final-form-govuk-helpers'
import IncentiveLevelCreated from '../../IncentiveLevelCreated'
import { userType } from '../../types'
import { ConditionalRadio } from './AttendanceOtherForm.styles'

export function AttendanceOtherForm({
  user,
  offender,
  updateOffenderAttendance,
  absentReasons,
  absentReasons: { triggersIEP, triggersAbsentSubReason },
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
  const { id, absentReason, absentSubReason, comments } = attendanceInfo || {}
  const shouldTriggerIEP = (r) => triggersIEP && triggersIEP.includes(r)
  const shouldTriggerSubReason = (r) => triggersAbsentSubReason && triggersAbsentSubReason.includes(r)

  const validateThenSubmit = (submitHandler) => async (values) => {
    const formErrors = []
    const commentText = values.comments && values.comments.trim()

    if (!values.pay) {
      formErrors.push({
        targetName: 'pay',
        text: `Select if you want to pay ${formatName(offender.firstName, offender.lastName)}`,
      })
    }

    if (!values.absentReason && values.pay === 'yes') {
      formErrors.push({
        targetName: 'absentReason',
        text: `Select why you want to pay ${formatName(offender.firstName, offender.lastName)}`,
      })
    }

    if (!values.absentReason && values.pay === 'no') {
      formErrors.push({
        targetName: 'absentReason',
        text: `Select why ${formatName(offender.firstName, offender.lastName)} did not attend`,
      })
    }

    if (!values.absentSubReason && shouldTriggerSubReason(values.absentReason)) {
      formErrors.push({ targetName: 'absentSubReason', text: 'Select an absence reason' })
    }

    if (!values.iep && shouldTriggerIEP(values.absentReason)) {
      formErrors.push({ targetName: 'iep', text: 'Select if you want to add an incentive level warning' })
    }

    if (!commentText) {
      formErrors.push({ targetName: 'comments', text: 'Enter more details' })
    }

    if (commentText && commentText.length < 3) {
      formErrors.push({ targetName: 'comments', text: 'Enter more details using 3 or more characters' })
    }

    if (commentText && commentText.length > 240) {
      formErrors.push({ targetName: 'comments', text: 'Maximum length should not exceed 240 characters' })
    }

    if (formErrors.length > 0) return { [FORM_ERROR]: formErrors }

    const attendanceUpdated = await submitHandler(values)

    if (attendanceUpdated && values.iep === 'yes') {
      // need to find selected options so can put into the case note
      const absentReasonOption = absentReasons.unpaidReasons.find((ar) => ar.value === values.absentReason)
      const absentSubReasonOption = absentReasons.unpaidSubReasons.find((ar) => ar.value === values.absentSubReason)

      const caseNoteSuffix = absentSubReasonOption
        ? `${absentSubReasonOption.name}. ${values.comments}`
        : values.comments
      const iepValues = {
        pay: values.pay,
        caseNote: `${absentReasonOption.name} - incentive level warning - ${caseNoteSuffix}`,
      }
      showModal(
        true,
        <IncentiveLevelCreated
          showModal={showModal}
          offender={offender}
          iepValues={iepValues}
          activityName={activityName}
          user={user}
        />
      )
    }

    return attendanceUpdated
  }

  const payOffender = (values) => {
    const paid = values.pay === 'yes'
    const reasons = [...absentReasons.paidReasons, ...absentReasons.unpaidReasons]

    const absentReasonValueWithIep =
      values.absentReason && `${values.absentReason}${values.iep === 'yes' ? 'IncentiveLevelWarning' : ''}`

    const attendanceDetails = {
      id,
      offenderNo,
      bookingId,
      paid,
      eventId,
      eventLocationId,
      absentReason: reasons.find((ar) => ar.value === absentReasonValueWithIep),
      absentSubReason: values.absentSubReason,
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

  const getAbsentReasons = (pay) => {
    if (!pay) return []
    return pay === 'yes' ? absentReasons.paidReasons : absentReasons.unpaidReasonsWithoutIep
  }
  const getAbsentSubReasons = (pay, reason) => {
    if (!pay || !shouldTriggerSubReason(reason)) return []
    return pay === 'yes' ? absentReasons.paidSubReasons : absentReasons.unpaidSubReasons
  }

  const getPreviousPayStatus = () => {
    if (id) return attendanceInfo.paid ? 'yes' : 'no'
    return undefined
  }

  const initialValues = {
    pay: getPreviousPayStatus(),
    absentReason: absentReason?.value?.replace('IncentiveLevelWarning', ''),
    absentSubReason,
    iep: absentReason?.value?.includes('IncentiveLevelWarning') ? 'yes' : 'no',
    comments,
  }

  const cancelHandler = () => showModal(false)

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => validateThenSubmit(payOffender, showModal)(values)}
      render={({ handleSubmit, submitting, pristine, submitError: errors, values }) => (
        <form onSubmit={handleSubmit}>
          {errors && (
            <ErrorSummary
              onHandleErrorClick={onHandleErrorClick}
              heading="There is a problem"
              errors={errors}
              data-test="error-summary"
            />
          )}
          <WhenFieldChanges field="pay" becomes={values.pay || ''} set="absentReason" to="" />
          <WhenFieldChanges field="absentReason" becomes={values.absentReason || ''} set="absentSubReason" to="" />
          <WhenFieldChanges field="absentReason" becomes={values.absentReason || ''} set="iep" to="" />
          <Fieldset>
            <Fieldset.Legend size="MEDIUM" isPageHeading>
              Do you want to pay {formatName(offender.firstName, offender.lastName)}?
            </Fieldset.Legend>
            <FieldWithError
              name="pay"
              errors={errors}
              component={RadioGroup}
              options={[
                { title: 'Yes', value: 'yes' },
                { title: 'No', value: 'no' },
              ]}
              inline
            />
            {values.pay && (
              <FieldWithError errors={errors} name="absentReason" component={MultiChoice} label="Select a reason">
                {getAbsentReasons(values.pay).map((r) => (
                  <div key={r.value}>
                    <Field name="absentReason">
                      {(props) => (
                        <div>
                          <Radio
                            name={props.input.name}
                            value={r.value}
                            onChange={props.input.onChange}
                            checked={props.input.value === r.value}
                          >
                            {r.name}
                          </Radio>
                        </div>
                      )}
                    </Field>
                    {r.value === values.absentReason && shouldTriggerSubReason(values.absentReason) && (
                      <ConditionalRadio>
                        <FieldWithError
                          errors={errors}
                          name="absentSubReason"
                          component={Select}
                          label="Select an absence reason"
                        >
                          <option value="" disabled>
                            Select
                          </option>
                          {getAbsentSubReasons(values.pay, values.absentReason).map((reason) => (
                            <option key={reason.value} value={reason.value}>
                              {reason.name}
                            </option>
                          ))}
                        </FieldWithError>
                        {shouldTriggerIEP(values.absentReason) && (
                          <FieldWithError
                            name="iep"
                            errors={errors}
                            component={RadioGroup}
                            label="Do you want to add an incentive level warning"
                            options={[
                              { title: 'Yes', value: 'yes' },
                              { title: 'No', value: 'no' },
                            ]}
                            inline
                          />
                        )}
                      </ConditionalRadio>
                    )}
                  </div>
                ))}
              </FieldWithError>
            )}
            <FieldWithError errors={errors} name="comments" component={TextArea}>
              Enter more details
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
    unpaidReasonsWithoutIep: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, name: PropTypes.string }))
      .isRequired,
    triggersIEP: PropTypes.arrayOf(PropTypes.string).isRequired,
    triggersAbsentSubReason: PropTypes.arrayOf(PropTypes.string).isRequired,
    paidSubReasons: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, name: PropTypes.string })).isRequired,
    unpaidSubReasons: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, name: PropTypes.string }))
      .isRequired,
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
      absentSubReason: PropTypes.string,
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

const mapStateToProps = (state) => ({
  user: state.app.user,
  absentReasons: state.events.absentReasons,
})

export default connect(mapStateToProps)(AttendanceOtherForm)
