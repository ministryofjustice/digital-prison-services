import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import Select from '@govuk-react/select'
import { spacing } from '@govuk-react/lib'
import { BORDER_COLOUR } from 'govuk-colours'

import WhereaboutsDatePicker from '../DatePickers/WhereaboutsDatePicker'
import { CELL_LOCATION, LAST_NAME } from '../tablesorting/sortColumns'
import SortLov from '../tablesorting/SortLov'

const Container = styled.div`
  ${spacing.withWhiteSpace({ margin: { size: 3, direction: 'bottom' } })};

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

const MissingPrisonersSearch = ({ handleDateChange, date, handlePeriodChange, period, sortOrder, setColumnSort }) => (
  <Container>
    <SearchContainer>
      <GridRow>
        <GridCol setWidth="one-quarter">
          <WhereaboutsDatePicker handleDateChange={handleDateChange} date={date} />
        </GridCol>
        <GridCol setWidth="one-quarter">
          <FullWidthSelect
            name="period"
            label="Period"
            input={{
              value: period,
              onChange: handlePeriodChange,
            }}
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
      </GridRow>
    </SearchContainer>

    <SortLov
      sortColumns={[LAST_NAME, CELL_LOCATION]}
      sortColumn={sortOrder.orderColumn}
      sortOrder={sortOrder.orderDirection}
      setColumnSort={setColumnSort}
    />
  </Container>
)

MissingPrisonersSearch.propTypes = {
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
  sortOrder: PropTypes.shape({ orderColumn: PropTypes.string, orderDirection: PropTypes.string }).isRequired,
}

export default MissingPrisonersSearch
