import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { H1 } from '@govuk-react/heading'
import Paragraph from '@govuk-react/paragraph'
import HintText from '@govuk-react/hint-text'
import Button from '@govuk-react/button'

import { ButtonContainer, ButtonCancel } from '../Components/Buttons'
import { userType } from '../types'
import { properCaseName, pascalToString } from '../utils'

const IEPCreatedMessage = styled.div`
  @media print {
    display: none;
  }
`

const IEPCreated = ({ showModal, offender, iepValues, activityName, user }) => {
  const setPrintIepData = () => {
    const iepSlipData = {
      raisedBy: user.name,
      issuedBy: user.name,
      offenderNo: offender.offenderNo,
      offenderName: `${properCaseName(offender.firstName)} ${properCaseName(offender.lastName)}`,
      caseNote: `${pascalToString(iepValues.absentReason)}: ${iepValues.comments}`,
      cellLocation: offender.cellLocation,
      activityName,
    }

    localStorage.setItem('iepSlip', JSON.stringify(iepSlipData))
  }

  const handlePrint = () => {
    setPrintIepData()
    window.open('/iep-slip', '_blank')
    showModal(false)
  }

  const isMobile = /Mobi|Android/i.test(navigator.userAgent)

  return (
    <div data-qa="iep-created">
      <IEPCreatedMessage>
        <H1 size="MEDIUM">An IEP has been created</H1>
        <ButtonContainer>
          {!isMobile && (
            <>
              <Paragraph>Do you want to print an IEP warning slip?</Paragraph>
              <HintText>You can also print this later from their case notes.</HintText>
              <Button onClick={handlePrint} mb={0}>
                Yes - print slip
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
      </IEPCreatedMessage>
    </div>
  )
}

IEPCreated.propTypes = {
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
    absentReason: PropTypes.string,
    comments: PropTypes.string,
  }).isRequired,
}

export default IEPCreated
