import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { H2 } from '@govuk-react/heading'
import { BORDER_COLOUR } from 'govuk-colours'
import { spacing, typography } from '@govuk-react/lib'
import moment from 'moment'
import { forenameToInitial } from '../../utils'

const IncentiveLevelSlipDetails = styled.div`
  ${typography.font({ size: 19 })};
  border-bottom: 1px dashed ${BORDER_COLOUR};
`

const Row = styled.div`
  display: flex;
  align-items: center;
  border-bottom: ${(props) => (props.noBorder ? 'none' : `1px solid ${BORDER_COLOUR}`)};
  margin-bottom: ${spacing.simple(3)}px;
  padding-bottom: ${spacing.simple(3)}px;
`

const Column = styled.div`
  flex: 1 0 0;
  padding-right: ${spacing.simple(3)}px;
`

const Value = styled.span`
  font-weight: bold;
  display: ${(props) => (props.inline ? 'inline' : 'block')};
`

const Amendment = styled.div`
  margin-top: ${spacing.simple(3)}px;
`

function IncentiveLevelSlip({
  type,
  raisedDate,
  raisedBy,
  issuedBy,
  offenderName,
  offenderNo,
  caseNote,
  activityName,
  cellLocation,
  amendments,
}) {
  return (
    <IncentiveLevelSlipDetails>
      <Row>
        <Column>
          <H2 size="MEDIUM" mb={0}>
            {type || 'Incentive Level warning'}
          </H2>
        </Column>
        <Column>
          Date and time: <Value inline>{moment(raisedDate).format('D MMMM YYYY, h:mm a')}</Value>
        </Column>
      </Row>
      <Row>
        <Column>
          Name: <Value>{offenderName}</Value>
        </Column>
        <Column>
          Number: <Value>{offenderNo}</Value>
        </Column>
        <Column>
          Location: <Value>{cellLocation}</Value>
        </Column>
        {activityName && (
          <Column>
            Activity or area: <Value>{activityName}</Value>
          </Column>
        )}
      </Row>
      <Row>
        <Column>
          Reason:
          <Value>{caseNote}</Value>
          {amendments.length > 0 &&
            amendments.map((amendment) => (
              <Amendment key={amendment.creationDateTime}>
                Amendment: <Value>{amendment.additionalNoteText}</Value>
                {amendment.creationDateTime && (
                  <div>{moment(amendment.creationDateTime).format('D MMMM YYYY, h:mm a')}</div>
                )}
                {amendment.authorName && <div>{forenameToInitial(amendment.authorName)}</div>}
              </Amendment>
            ))}
        </Column>
      </Row>
      <Row noBorder>
        <Column>
          Raised by: <Value inline>{forenameToInitial(raisedBy)}</Value>
        </Column>
        <Column>
          Date: <Value inline>{moment(raisedDate).format('D MMMM YYYY')}</Value>
        </Column>
      </Row>
      <Row noBorder>
        <Column>
          Issued by: <Value inline>{forenameToInitial(issuedBy)}</Value>
        </Column>
        <Column>
          Date: <Value inline>{moment().format('D MMMM YYYY')}</Value>
        </Column>
      </Row>
    </IncentiveLevelSlipDetails>
  )
}

IncentiveLevelSlip.propTypes = {
  type: PropTypes.string,
  raisedDate: PropTypes.string,
  raisedBy: PropTypes.string,
  issuedBy: PropTypes.string,
  offenderName: PropTypes.string,
  offenderNo: PropTypes.string,
  caseNote: PropTypes.string,
  activityName: PropTypes.string,
  cellLocation: PropTypes.string,
  amendments: PropTypes.arrayOf(
    PropTypes.shape({
      authorName: PropTypes.string,
      creationDateTime: PropTypes.string,
      additionalNoteText: PropTypes.string,
    })
  ),
}

IncentiveLevelSlip.defaultProps = {
  type: undefined,
  raisedDate: undefined,
  raisedBy: undefined,
  issuedBy: undefined,
  offenderName: undefined,
  offenderNo: undefined,
  caseNote: undefined,
  activityName: undefined,
  cellLocation: undefined,
  amendments: [],
}

export default IncentiveLevelSlip
