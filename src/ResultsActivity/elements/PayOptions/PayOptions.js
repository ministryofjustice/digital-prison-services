import React, { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Radio from '@govuk-react/radio'
import VisuallyHidden from '@govuk-react/visually-hidden'
import { Spinner } from '@govuk-react/icons'
import { spacing } from '@govuk-react/lib'

import { isWithinLastWeek } from '../../../utils'
import PayOtherForm from '../PayOtherForm'
import { Option, UpdateLink, PayMessage, OtherMessage } from './PayOptions.styles'

function PayOptions({ offenderDetails, updateOffenderAttendance, date, openModal, closeModal }) {
  const radioSize = `${spacing.simple(7)}px`
  const [selectedOption, setSelectedOption] = useState()
  const [isPaying, setIsPaying] = useState()
  const { offenderNo, bookingId, eventId, eventLocationId, offenderIndex, attendanceInfo } = offenderDetails
  const { id, pay, other, locked, paid } = attendanceInfo || {}

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
    await updateOffenderAttendance(attendanceDetails, offenderIndex)
    setIsPaying(false)
  }

  useEffect(() => {
    if (attendanceInfo && pay) setSelectedOption('pay')
    if (attendanceInfo && other) setSelectedOption('other')
  })

  const renderForm = () =>
    openModal(
      <PayOtherForm
        offender={offenderDetails}
        cancelHandler={closeModal}
        updateOffenderAttendance={updateOffenderAttendance}
      />
    )

  const allowUpdate = selectedOption === 'other'

  const showRadioButton = !locked && offenderNo && eventId && isWithinLastWeek(date)

  const payMessage = () => {
    if (paid && locked) return 'Paid'
    if (!paid && locked) return 'Not paid'
    if (!paid && !other && !isWithinLastWeek(date)) return 'Not Recorded'
    return null
  }

  return (
    <Fragment>
      <Option data-qa="pay-option" className="row-gutters">
        {payMessage() && <PayMessage data-qa="pay-message">{payMessage()}</PayMessage>}
        {!isPaying &&
          showRadioButton && (
            <Radio onChange={payOffender} name={offenderNo} value="pay" checked={selectedOption === 'pay'}>
              <VisuallyHidden>Pay</VisuallyHidden>
            </Radio>
          )}
        {isPaying && <Spinner title="Paying" height={radioSize} width={radioSize} />}
      </Option>

      <Option data-qa="other-option" className="row-gutters">
        {showRadioButton && (
          <Radio name={offenderNo} onChange={renderForm} value="other" checked={selectedOption === 'other'}>
            <VisuallyHidden>Other</VisuallyHidden>
          </Radio>
        )}
        {allowUpdate &&
          other && (
            <UpdateLink onClick={renderForm}>
              <OtherMessage data-qa="other-message">View/ Update</OtherMessage>
            </UpdateLink>
          )}
      </Option>
    </Fragment>
  )
}

PayOptions.propTypes = {
  offenderDetails: PropTypes.shape({
    offenderNo: PropTypes.string,
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
  date: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  updateOffenderAttendance: PropTypes.func.isRequired,
}

PayOptions.defaultProps = {
  offenderDetails: undefined,
}

export default PayOptions
