import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { IncentiveLevelSlip } from 'new-nomis-shared-components'
import { spacing } from '@govuk-react/lib'

const qs = require('qs')

const StyledIncentiveLevelSlipContainer = styled.div`
  padding: ${spacing.simple(3)}px;
`

function IncentiveLevelSlipContainer() {
  const [iepData, setIepData] = useState()
  const [printed, setPrinted] = useState(false)

  useEffect(() => {
    const setUpData = async () => {
      const data = localStorage.getItem('incentiveLevelSlip')
      if (data) {
        setIepData(JSON.parse(data))
      } else if (!printed && !iepData) {
        const { offenderNo, offenderName, location, casenoteId, issuedBy } = qs.parse(
          window.location.href.split('?')[1]
        )
        const caseNoteData = await axios
          .get(`/api/get-case-note/${offenderNo}/${casenoteId}`)
          .then(promise => promise.data)

        setIepData({
          type: caseNoteData.subTypeDescription,
          raisedDate: caseNoteData.creationDateTime,
          raisedBy: caseNoteData.authorName,
          issuedBy,
          offenderName,
          offenderNo,
          caseNote: caseNoteData.text,
          cellLocation: location,
          amendments: caseNoteData.amendments,
        })
      }
    }
    setUpData()

    if (iepData && !printed) {
      window.print()
      setPrinted(true)
    }
  })

  window.onafterprint = () => {
    localStorage.clear()
    window.close()
  }

  return (
    <StyledIncentiveLevelSlipContainer>
      <IncentiveLevelSlip {...iepData} />
    </StyledIncentiveLevelSlipContainer>
  )
}

export default IncentiveLevelSlipContainer
