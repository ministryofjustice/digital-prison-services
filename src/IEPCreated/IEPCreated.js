import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { H1 } from '@govuk-react/heading'
import Paragraph from '@govuk-react/paragraph'
import HintText from '@govuk-react/hint-text'
import Button from '@govuk-react/button'

import { ButtonContainer, ButtonCancel } from '../Components/Buttons'
import IEPSlip from '../IEPSlip'
import { userType } from '../types'

const IEPCreatedMessage = styled.div`
  @media print {
    display: none;
  }
`

const IEPCreated = ({ showModal, offender, iepValues, activityName, user }) => {
  const print = () => window.print()
  const cancelPrint = () => showModal(false)
  const isMobile = /Mobi|Android/i.test(navigator.userAgent)

  window.onafterprint = () => cancelPrint()

  return (
    <div data-qa="iep-created">
      <IEPCreatedMessage>
        <H1 size="MEDIUM">An IEP has been created</H1>
        <ButtonContainer>
          {!isMobile && (
            <Fragment>
              <Paragraph>Do you want to print an IEP warning slip?</Paragraph>
              <HintText>You can also print this later from their case notes.</HintText>
              <Button mb={0} onClick={print}>
                Yes - print slip
              </Button>
              <ButtonCancel mb={0} onClick={cancelPrint}>
                No
              </ButtonCancel>
            </Fragment>
          )}
          {isMobile && (
            <Button mb={0} onClick={cancelPrint}>
              Close
            </Button>
          )}
        </ButtonContainer>
      </IEPCreatedMessage>
      <IEPSlip offender={offender} iepValues={iepValues} activityName={activityName} user={user} />
    </div>
  )
}

IEPCreated.propTypes = {
  user: userType.isRequired,
  showModal: PropTypes.func.isRequired,
  offender: PropTypes.shape({}).isRequired,
  activityName: PropTypes.string.isRequired,
  iepValues: PropTypes.shape({
    pay: PropTypes.string,
    absentReason: PropTypes.string,
    comments: PropTypes.string,
  }).isRequired,
}

export default IEPCreated
