import React, { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Radio from '@govuk-react/radio'
import VisuallyHidden from '@govuk-react/visually-hidden'
import { MEDIA_QUERIES } from '@govuk-react/constants'

const Option = styled.td`
  label {
    margin-bottom: 0;
  }

  ${MEDIA_QUERIES.PRINT} {
    transform: scale(0.4);
  }
`
function PayOptions({
  offenderNo,
  eventId,
  eventLocationId,
  updateOffenderAttendance,
  otherHandler,
  firstName,
  lastName,
  payStatus,
  offenderIndex,
}) {
  if (!offenderNo || !eventId) return null
  const [selectedOption, setSelectedOption] = useState()

  const payOffender = async () => {
    const attendanceDetails = {
      offenderNo,
      attended: true,
      paid: true,
      eventId,
      eventLocationId,
    }

    await updateOffenderAttendance(attendanceDetails, offenderIndex)
    setSelectedOption('pay')
  }

  useEffect(() => {
    if (payStatus && payStatus.pay) setSelectedOption('pay')
    if (payStatus && payStatus.other) setSelectedOption('other')
  })

  return (
    <Fragment>
      <Option>
        <Radio onChange={payOffender} name={offenderNo} value="pay" checked={selectedOption === 'pay'}>
          <VisuallyHidden>Pay</VisuallyHidden>
        </Radio>
      </Option>

      <Option>
        <Radio
          name={offenderNo}
          onChange={otherHandler}
          value="other"
          data-first-name={firstName}
          data-last-name={lastName}
          data-event-id={eventId}
          data-event-location-id={eventLocationId}
          data-offender-index={offenderIndex}
          checked={selectedOption === 'other'}
        >
          <VisuallyHidden>Other</VisuallyHidden>
        </Radio>
      </Option>
    </Fragment>
  )
}

PayOptions.propTypes = {
  offenderNo: PropTypes.string,
  eventId: PropTypes.number,
  otherHandler: PropTypes.func.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  payStatus: PropTypes.shape({ pay: PropTypes.bool, other: PropTypes.bool }),
  eventLocationId: PropTypes.number,
  updateOffenderAttendance: PropTypes.func.isRequired,
  offenderIndex: PropTypes.number,
}

PayOptions.defaultProps = {
  offenderNo: undefined,
  eventId: undefined,
  firstName: undefined,
  lastName: undefined,
  payStatus: undefined,
  eventLocationId: undefined,
  offenderIndex: undefined,
}

export default PayOptions
