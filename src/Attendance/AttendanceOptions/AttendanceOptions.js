import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import Radio from '@govuk-react/radio'
import VisuallyHidden from '@govuk-react/visually-hidden'
import { Spinner } from '@govuk-react/icons'
import { spacing } from '@govuk-react/lib'

import { isWithinLastWeek } from '../../utils'
import AttendanceOtherForm from '../AttendanceOtherForm'
import { Option, UpdateLink, PayMessage, OtherMessage } from './AttendanceOptions.styles'
import { attendanceUpdated } from '../attendanceGAEvents'

export const updateOffenderAttendance = async (
  attendanceDetails,
  offenderIndex,
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
) => {
  let updateSuccess = false
  const eventDetails = { prisonId: agencyId, period, eventDate: date }
  const { id, attended, paid, absentReason, comments } = attendanceDetails || {}

  const offenderAttendanceData = {
    comments,
    paid,
    absentReason,
    pay: attended && paid,
    other: Boolean(absentReason),
  }

  resetErrorDispatch()

  try {
    const response = await axios.post('/api/attendance', {
      ...eventDetails,
      ...attendanceDetails,
      absentReason: attendanceDetails.absentReason && attendanceDetails.absentReason.value,
    })
    offenderAttendanceData.id = response.data.id || id
    setOffenderAttendance(offenderIndex, offenderAttendanceData)
    updateSuccess = true
  } catch (error) {
    if (error.response.status === 409) {
      window.scrollTo(0, 0)
      setErrorDispatch({
        message: 'An outcome for this offender has already been saved.',
        showReload: true,
        reloadPage,
      })
    } else {
      handleError(error)
    }
    updateSuccess = false
  }

  showModal(false)
  if (offenderAttendanceData.pay) setSelectedOption('pay')
  if (offenderAttendanceData.other) setSelectedOption('other')
  raiseAnalyticsEvent(attendanceUpdated(offenderAttendanceData, agencyId))

  return updateSuccess
}

function AttendanceOptions({
  offenderDetails,
  date,
  noPay,
  showModal,
  activityName,
  resetErrorDispatch,
  setErrorDispatch,
  raiseAnalyticsEvent,
  handleError,
  setOffenderAttendance,
  agencyId,
  period,
  reloadPage,
}) {
  const radioSize = `${spacing.simple(7)}px`
  const [selectedOption, setSelectedOption] = useState()
  const [isPaying, setIsPaying] = useState()
  const { offenderNo, bookingId, eventId, eventLocationId, offenderIndex, attendanceInfo } = offenderDetails
  const { id, pay, other, locked, paid, absentReason } = attendanceInfo || {}

  const payOffender = async () => {
    const attendanceDetails = {
      id,
      offenderNo,
      bookingId,
      eventId,
      eventLocationId,
      attended: true,
      paid: true,
    }

    setIsPaying(true)
    await updateOffenderAttendance(
      attendanceDetails,
      offenderIndex,
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
    setIsPaying(false)
  }

  useEffect(() => {
    if (attendanceInfo && pay) setSelectedOption('pay')
    if (attendanceInfo && other) setSelectedOption('other')
  })

  const renderForm = () =>
    showModal(
      true,
      <AttendanceOtherForm
        offender={offenderDetails}
        updateOffenderAttendance={updateOffenderAttendance}
        raiseAnalyticsEvent={raiseAnalyticsEvent}
        resetErrorDispatch={resetErrorDispatch}
        setErrorDispatch={setErrorDispatch}
        reloadPage={reloadPage}
        handleError={handleError}
        agencyId={agencyId}
        period={period}
        showModal={showModal}
        activityName={activityName}
        setOffenderAttendance={setOffenderAttendance}
        setSelectedOption={setSelectedOption}
        date={date}
      />
    )

  const notRecorded = !paid && !other && !isWithinLastWeek(date)
  const showRadioButton = !locked && offenderNo && eventId && isWithinLastWeek(date)

  const payMessage = () => {
    if (paid && locked) return 'Paid'
    if (!paid && locked) return 'Not paid'
    if (notRecorded) return 'Not Recorded'
    return null
  }

  return (
    <>
      {!noPay && (
        <>
          {absentReason && (
            <Option data-qa="absent-reason" printOnly>
              {absentReason.name}
            </Option>
          )}
          <Option data-qa="pay-option" className="row-gutters">
            {payMessage() && <PayMessage data-qa="pay-message">{payMessage()}</PayMessage>}
            {!isPaying &&
              showRadioButton && (
                <Radio
                  onChange={payOffender}
                  name={offenderNo + eventId}
                  value="pay"
                  checked={selectedOption === 'pay'}
                >
                  <VisuallyHidden>Pay</VisuallyHidden>
                </Radio>
              )}
            {isPaying && <Spinner title="Paying" height={radioSize} width={radioSize} />}
          </Option>
        </>
      )}
      <Option data-qa="other-option" className="row-gutters">
        {showRadioButton &&
          !absentReason && (
            <Radio name={offenderNo + eventId} onChange={renderForm} value="other" checked={selectedOption === 'other'}>
              <VisuallyHidden>Other</VisuallyHidden>
            </Radio>
          )}
        {absentReason &&
          !locked && (
            <UpdateLink role="link" onClick={renderForm}>
              <OtherMessage data-qa="other-message">{absentReason.name}</OtherMessage>
            </UpdateLink>
          )}
        {absentReason && locked && <OtherMessage data-qa="other-message">{absentReason.name}</OtherMessage>}
        {noPay && notRecorded && <OtherMessage data-qa="other-message">Not Recorded</OtherMessage>}
      </Option>
    </>
  )
}

AttendanceOptions.propTypes = {
  offenderDetails: PropTypes.shape({
    offenderNo: PropTypes.string,
    bookingId: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    eventId: PropTypes.number,
    eventLocationId: PropTypes.number,
    offenderIndex: PropTypes.number,
    attendanceInfo: PropTypes.shape({
      id: PropTypes.number,
      pay: PropTypes.bool,
      other: PropTypes.bool,
    }),
  }),
  agencyId: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  setOffenderAttendance: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setErrorDispatch: PropTypes.func.isRequired,
  reloadPage: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
  noPay: PropTypes.bool,
  showModal: PropTypes.func.isRequired,
  activityName: PropTypes.string.isRequired,
}

AttendanceOptions.defaultProps = {
  offenderDetails: undefined,
  noPay: false,
}

export default AttendanceOptions
