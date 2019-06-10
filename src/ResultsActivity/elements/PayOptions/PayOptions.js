import React, { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Radio from '@govuk-react/radio'
import VisuallyHidden from '@govuk-react/visually-hidden'

import { isWithinLastYear } from '../../../utils'
import PayDetails from '../PayDetails'
import PayOtherForm from '../PayOtherForm'
import { Option, DetailsLink } from './PayOptions.styles'

function PayOptions({ offenderDetails, updateOffenderAttendance, date, openModal, closeModal }) {
  const [selectedOption, setSelectedOption] = useState()
  const { offenderNo, eventId, eventLocationId, offenderIndex, attendanceInfo } = offenderDetails
  const { id } = attendanceInfo || {}

  const payOffender = () => {
    const attendanceDetails = {
      id,
      offenderNo,
      eventId,
      eventLocationId,
      attended: true,
      paid: true,
    }

    updateOffenderAttendance(attendanceDetails, offenderIndex)
  }

  useEffect(() => {
    if (attendanceInfo && attendanceInfo.pay) setSelectedOption('pay')
    if (attendanceInfo && attendanceInfo.other) setSelectedOption('other')
  })

  const renderDetails = () =>
    openModal(
      <PayDetails
        paid={attendanceInfo.paid}
        absentReason={attendanceInfo.absentReason}
        comments={attendanceInfo.comments}
        cancelHandler={closeModal}
      />
    )

  const renderForm = () =>
    openModal(
      <PayOtherForm
        offender={offenderDetails}
        cancelHandler={closeModal}
        updateOffenderAttendance={updateOffenderAttendance}
      />
    )

  const showDetails = () => {
    if (selectedOption === 'other' && isWithinLastYear(date)) return true
    return false
  }

  return (
    <Fragment>
      <Option data-qa="pay-option">
        {offenderNo &&
          eventId && (
            <Radio onChange={payOffender} name={offenderNo} value="pay" checked={selectedOption === 'pay'}>
              <VisuallyHidden>Pay</VisuallyHidden>
            </Radio>
          )}
      </Option>

      <Option data-qa="other-option">
        {offenderNo &&
          eventId && (
            <>
              <Radio name={offenderNo} onChange={renderForm} value="other" checked={selectedOption === 'other'}>
                <VisuallyHidden>Other</VisuallyHidden>
              </Radio>
              {showDetails() && <DetailsLink onClick={renderDetails}>Details</DetailsLink>}
            </>
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
      pay: PropTypes.bool,
      other: PropTypes.bool,
      absentReason: PropTypes.string,
      comments: PropTypes.string,
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
