import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { H2 } from '@govuk-react/heading'
import Paragraph from '@govuk-react/paragraph'
import ButtonCancel from '../ButtonCancel'
import { pascalToString } from '../../../utils'

const PayDetails = ({ paid, absentReason, comments, cancelHandler }) => (
  <Fragment>
    <H2 size="SMALL" mb={0}>
      Status
    </H2>
    <Paragraph>{paid ? 'Paid' : 'Not paid'}</Paragraph>
    <H2 size="SMALL" mb={0}>
      Reason
    </H2>
    <Paragraph>{pascalToString(absentReason)}</Paragraph>
    <H2 size="SMALL" mb={0}>
      Comments or case note
    </H2>
    <Paragraph>{comments}</Paragraph>

    <ButtonCancel mb={0} onClick={cancelHandler} type="button">
      Close
    </ButtonCancel>
  </Fragment>
)

PayDetails.propTypes = {
  paid: PropTypes.bool,
  absentReason: PropTypes.string,
  comments: PropTypes.string,
  cancelHandler: PropTypes.func.isRequired,
}

PayDetails.defaultProps = {
  paid: false,
  absentReason: undefined,
  comments: undefined,
}

export default PayDetails
