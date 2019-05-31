import React, { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Radio from '@govuk-react/radio'
import VisuallyHidden from '@govuk-react/visually-hidden'

import PayDetails from '../PayDetails'
import PayOtherForm from '../PayOtherForm'
import { Option, DetailsLink } from './PayOptions.styles'

function PayOptions({ offenderDetails, updateOffenderAttendance, openModal, closeModal }) {
  const [selectedOption, setSelectedOption] = useState()
  const { offenderNo, eventId, eventLocationId, offenderIndex, attendanceInfo } = offenderDetails

  const payOffender = () => {
    const attendanceDetails = {
      offenderNo,
      attended: true,
      paid: true,
      eventId,
      eventLocationId,
    }

    updateOffenderAttendance(attendanceDetails, offenderIndex)
  }

  useEffect(() => {
    if (attendanceInfo && attendanceInfo.pay) setSelectedOption('pay')
    if (attendanceInfo && attendanceInfo.other) setSelectedOption('other')
  })

  const attedanceRecorded = Boolean(selectedOption)

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

  return (
    <Fragment>
      <Option data-qa="pay-option">
        {offenderNo &&
          eventId && (
            <Radio
              onChange={payOffender}
              name={offenderNo}
              value="pay"
              checked={selectedOption === 'pay'}
              disabled={attedanceRecorded}
            >
              <VisuallyHidden>Pay</VisuallyHidden>
            </Radio>
          )}
      </Option>

      <Option data-qa="other-option">
        {offenderNo &&
          eventId && (
            <>
              <Radio
                name={offenderNo}
                onChange={renderForm}
                value="other"
                checked={selectedOption === 'other'}
                disabled={attedanceRecorded}
              >
                <VisuallyHidden>Other</VisuallyHidden>
              </Radio>
              {selectedOption === 'other' && <DetailsLink onClick={renderDetails}>Details</DetailsLink>}
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
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,

  updateOffenderAttendance: PropTypes.func.isRequired,
}

PayOptions.defaultProps = {
  offenderDetails: undefined,
}

export default PayOptions
