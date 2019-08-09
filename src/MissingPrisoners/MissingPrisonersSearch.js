import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import moment from 'moment'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import Select from '@govuk-react/select'
import { spacing } from '@govuk-react/lib'
import Button from '@govuk-react/button'
import LeadParagraph from '@govuk-react/lead-paragraph'
import { BORDER_COLOUR } from 'govuk-colours'

import WhereaboutsDatePicker from '../DatePickers/WhereaboutsDatePicker'
import { LAST_NAME, ACTIVITY } from '../tablesorting/sortColumns'
import SortLov from '../tablesorting/SortLov'

const Container = styled.div`
  @media print {
    display: none;
  }
`

const SearchContainer = styled.div`
  border-bottom: 1px solid ${BORDER_COLOUR};
  ${spacing.withWhiteSpace({ margin: { size: 3, direction: 'bottom' } })};
`

const FullWidthSelect = styled(Select)`
  select {
    width: 100%;
  }
`

const RightAlignContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  height: 100%;
`

const pastAndPresentDay = date =>
  date.isBefore(
    moment()
      .add(1, 'days')
      .startOf('day')
  )

const MissingPrisonersSearch = ({
  handleDateChange,
  date,
  handlePeriodChange,
  period,
  sortOrder,
  setColumnSort,
  numberOfPrisoners,
}) => (
  <Container>
    <SearchContainer>
      <GridRow>
        <GridCol setWidth="one-quarter">
          <WhereaboutsDatePicker handleDateChange={handleDateChange} date={date} shouldShowDay={pastAndPresentDay} />
        </GridCol>
        <GridCol setWidth="one-quarter">
          <FullWidthSelect
            name="period"
            label="Period"
            input={{
              value: period,
              onChange: handlePeriodChange,
            }}
            mb={6}
          >
            <option key="MORNING" value="AM">
              Morning (AM)
            </option>
            <option key="AFTERNOON" value="PM">
              Afternoon (PM)
            </option>
            <option key="EVENING" value="ED">
              Evening (ED)
            </option>
          </FullWidthSelect>
        </GridCol>
        <GridCol>
          <RightAlignContainer>
            <Button onClick={() => window.print()}>Print list</Button>
          </RightAlignContainer>
        </GridCol>
      </GridRow>
    </SearchContainer>
    <GridRow>
      <GridCol setWidth="one-quarter">
        <SortLov
          sortColumns={[LAST_NAME, ACTIVITY]}
          sortColumn={sortOrder.orderColumn}
          sortOrder={sortOrder.orderDirection}
          setColumnSort={setColumnSort}
        />
      </GridCol>
      <GridCol>
        <RightAlignContainer>
          <LeadParagraph>
            Prisoners listed: <strong>{numberOfPrisoners}</strong>
          </LeadParagraph>
        </RightAlignContainer>
      </GridCol>
    </GridRow>
  </Container>
)

MissingPrisonersSearch.propTypes = {
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
  sortOrder: PropTypes.shape({ orderColumn: PropTypes.string, orderDirection: PropTypes.string }).isRequired,
  numberOfPrisoners: PropTypes.number.isRequired,
}

export default MissingPrisonersSearch
