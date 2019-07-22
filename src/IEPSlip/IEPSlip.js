import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { H2 } from '@govuk-react/heading'
import { BORDER_COLOUR } from 'govuk-colours'
import { spacing } from '@govuk-react/lib'
import moment from 'moment'

import { properCaseName, pascalToString, forenameToInitial } from '../utils'
import { Location } from '../Location'

const IEPSlipDetails = styled.div`
  display: none;
  border-bottom: 1px dashed ${BORDER_COLOUR};

  @media print {
    display: block;
  }
`

// govuk-react grid puts everything into mobile view for print
const Row = styled.div`
  display: flex;
  border-bottom: ${props => (props.noBorder ? 'none' : `1px solid ${BORDER_COLOUR}`)};
  margin-bottom: ${spacing.simple(3)}px;
  padding-bottom: ${spacing.simple(3)}px;
`

const Column = styled.div`
  flex: 1 0 0;
`

const Value = styled.span`
  font-weight: bold;
  display: ${props => (props.inline ? 'inline' : 'block')};
`

const IEPSlip = ({ offender, iepValues, raisedDate, activityName, user }) => {
  const { absentReason, comments } = iepValues

  return (
    <IEPSlipDetails>
      <Row>
        <Column>
          <H2 size="MEDIUM" mb={0}>
            IEP Warning
          </H2>
        </Column>
        <Column>
          Date and time: <Value inline>{raisedDate.format('D MMMM YYYY, h:mm a')}</Value>
        </Column>
      </Row>
      <Row>
        <Column>
          Name:{' '}
          <Value>
            {properCaseName(offender.firstName)} {properCaseName(offender.lastName)}
          </Value>
        </Column>
        <Column>
          Number: <Value>{offender.offenderNo}</Value>
        </Column>
        <Column>
          Location: <Value>{<Location location={offender.cellLocation} agencyId={user.activeCaseLoadId} />}</Value>
        </Column>
        <Column>
          Activity or area: <Value>{activityName}</Value>
        </Column>
      </Row>

      <Row>
        <Column>
          Reason:
          <Value>
            {pascalToString(absentReason)}: {comments}
          </Value>
        </Column>
      </Row>
      <Row noBorder>
        <Column>
          Raised by: <Value inline>{forenameToInitial(user.name)}</Value>
        </Column>
        <Column>
          Date: <Value inline>{raisedDate.format('D MMMM YYYY')}</Value>
        </Column>
      </Row>
      <Row noBorder>
        <Column>Issued by:</Column>
        <Column>
          Date: <Value inline>{raisedDate.format('D MMMM YYYY')}</Value>
        </Column>
      </Row>
    </IEPSlipDetails>
  )
}

IEPSlip.propTypes = {
  user: PropTypes.shape({}).isRequired,
  raisedDate: PropTypes.shape({}), // moment object
  activityName: PropTypes.string.isRequired,
  offender: PropTypes.shape({}).isRequired,
  iepValues: PropTypes.shape({
    pay: PropTypes.string,
    absentReason: PropTypes.string,
    comments: PropTypes.string,
  }).isRequired,
}

IEPSlip.defaultProps = {
  raisedDate: moment(),
}

export default IEPSlip
