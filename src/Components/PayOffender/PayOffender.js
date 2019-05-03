import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Radio from '@govuk-react/radio'
import VisuallyHidden from '@govuk-react/visually-hidden'
import axios from 'axios'
import { MEDIA_QUERIES } from '@govuk-react/constants'

const StyledPayOffender = styled.div`
  display: flex;

  label {
    margin-bottom: 0;
  }

  ${MEDIA_QUERIES.PRINT} {
    transform: scale(0.4);
  }
`

class PayOffender extends Component {
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
    const { offenderNo, eventId } = this.props

    if (!offenderNo || !eventId) return null

    return (
      <React.Fragment>
        <td>
          <StyledPayOffender>
            <Radio onChange={this.payOffender} name="payOptions">
              <VisuallyHidden>Pay</VisuallyHidden>
            </Radio>
          </StyledPayOffender>
        </td>
        <td>
          <StyledPayOffender>
            <Radio name="payOptions">
              <VisuallyHidden>Pay</VisuallyHidden>
            </Radio>
          </StyledPayOffender>
        </td>
      </React.Fragment>
    )
  }
}

PayOffender.propTypes = {
  offenderNo: PropTypes.string,
  eventId: PropTypes.number,
}

PayOffender.defaultProps = {
  offenderNo: undefined,
  eventId: undefined,
}

export default PayOffender
