import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import axios from 'axios'
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

class PayOptions extends Component {
  payOffender = async () => {
    const { offenderNo, eventId } = this.props

    try {
      await axios.put(`/api/updateAttendance?offenderNo=${offenderNo}&activityId=${eventId}`, {
        eventOutcome: 'ATT',
        performance: 'STANDARD',
        outcomeComment: '',
      })
    } catch (error) {
      // do nothing for now
    }
  }

  render() {
    const { offenderNo, eventId, otherHandler, firstName, lastName } = this.props

    if (!offenderNo || !eventId) return null

    return (
      <Fragment>
        <Option>
          <Radio onChange={this.payOffender} name={offenderNo} value="pay">
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
          >
            <VisuallyHidden>Other</VisuallyHidden>
          </Radio>
        </Option>
      </Fragment>
    )
  }
}

PayOptions.propTypes = {
  offenderNo: PropTypes.string,
  eventId: PropTypes.number,
  otherHandler: PropTypes.func.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
}

PayOptions.defaultProps = {
  offenderNo: undefined,
  eventId: undefined,
  firstName: undefined,
  lastName: undefined,
}

export default PayOptions
