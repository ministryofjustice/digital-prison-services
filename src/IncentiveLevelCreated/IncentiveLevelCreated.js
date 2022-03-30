import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { H1 } from '@govuk-react/heading'
import Paragraph from '@govuk-react/paragraph'
import HintText from '@govuk-react/hint-text'
import Button from '@govuk-react/button'

import { ButtonContainer, ButtonCancel } from '../Components/Buttons'
import { userType } from '../types'
import { properCaseName } from '../utils'

const IncentiveLevelCreatedMessage = styled.div`
  @media print {
    display: none;
  }
`

const IncentiveLevelCreated = ({ showModal, offender, iepValues, activityName, user }) => {
  const offenderName = `${properCaseName(offender.firstName)} ${properCaseName(offender.lastName)}`

  const setPrintIepData = () => {
    const incentiveLevelSlipData = {
      raisedBy: user.name,
      issuedBy: user.name,
      offenderNo: offender.offenderNo,
      offenderName,
      caseNote: iepValues.caseNote,
      cellLocation: offender.cellLocation,
      activityName,
    }

    localStorage.setItem('incentiveLevelSlip', JSON.stringify(incentiveLevelSlipData))
  }

  const handlePrint = () => {
    setPrintIepData()
    window.open('/iep-slip', '_blank')
    showModal(false)
  }

  const isMobile = /Mobi|Android/i.test(navigator.userAgent)
  const offenderNamePlural = `${offenderName}’${offenderName.endsWith('s') ? '' : 's'}`

  return (
    <div data-qa="iep-created">
      <IncentiveLevelCreatedMessage>
        <H1 size="MEDIUM">An incentive level warning has been created</H1>
        <ButtonContainer>
          {!isMobile && (
            <>
              <Paragraph>Do you want to print a copy of the incentive level warning?</Paragraph>
              <HintText>You can also print this later from {offenderNamePlural} case notes.</HintText>
              <Button onClick={handlePrint} mb={0}>
                Yes
              </Button>
              <ButtonCancel mb={0} onClick={() => showModal(false)}>
                No
              </ButtonCancel>
            </>
          )}
          {isMobile && (
            <Button mb={0} onClick={() => showModal(false)}>
              Close
            </Button>
          )}
        </ButtonContainer>
      </IncentiveLevelCreatedMessage>
    </div>
  )
}

IncentiveLevelCreated.propTypes = {
  user: userType.isRequired,
  showModal: PropTypes.func.isRequired,
  offender: PropTypes.shape({
    offenderNo: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    cellLocation: PropTypes.string,
  }).isRequired,
  activityName: PropTypes.string.isRequired,
  iepValues: PropTypes.shape({
    pay: PropTypes.string,
    caseNote: PropTypes.string,
  }).isRequired,
}

export default IncentiveLevelCreated
