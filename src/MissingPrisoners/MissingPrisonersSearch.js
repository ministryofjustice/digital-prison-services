import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import Select from '@govuk-react/select'
import { spacing } from '@govuk-react/lib'
import { BORDER_COLOUR } from 'govuk-colours'

import WhereaboutsDatePicker from '../DatePickers/WhereaboutsDatePicker'

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

const MissingPrisonersSearch = ({ handleDateChange, date, handlePeriodChange, period }) => (
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
    <GridRow>
      <GridCol setWidth="one-quarter">
        <FullWidthSelect
          name="order"
          label="Order the list"
          input={
            {
              // value: period,
              // onChange: handlePeriodChange,
            }
          }
        >
          <option value="lastName">Last name, first name</option>
        </FullWidthSelect>
      </GridCol>
    </GridRow>
  </Container>
)

MissingPrisonersSearch.propTypes = {
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
}

export default MissingPrisonersSearch
