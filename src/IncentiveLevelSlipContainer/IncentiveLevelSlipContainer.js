import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { IncentiveLevelSlip } from 'new-nomis-shared-components'
import { spacing } from '@govuk-react/lib'

const StyledIncentiveLevelSlipContainer = styled.div`
  padding: ${spacing.simple(3)}px;
`

function IncentiveLevelSlipContainer() {
  const [iepData, setIepData] = useState()
  const [printed, setPrinted] = useState(false)

  useEffect(() => {
    setIepData(JSON.parse(localStorage.getItem('incentiveLevelSlip')))

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
