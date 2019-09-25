import React from 'react'
import PropTypes from 'prop-types'
import '../lists.scss'

import moment from 'moment'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'

import Button from '@govuk-react/button'
import LeadParagraph from '@govuk-react/lead-paragraph'

import WhereaboutsDatePicker from '../DatePickers/WhereaboutsDatePicker'
import { LAST_NAME, ACTIVITY, CELL_LOCATION } from '../tablesorting/sortColumns'
import SortLov from '../tablesorting/SortLov'
import { linkOnClick, getCurrentPeriod, isTodayOrAfter, getLongDateFormat } from '../utils'

import {
  Container,
  SearchContainer,
  FullWidthSelect,
  RightAlignContainer,
  DummyLink,
} from './PrisonersUnaccountedForSearch.style'

const showPMPrisonerOption = (timeOfDay, date) => !isTodayOrAfter(date) || (timeOfDay === 'PM' || timeOfDay === 'ED')

const showEDPrisonerOption = (timeOfDay, date) => !isTodayOrAfter(date) || timeOfDay === 'ED'

const pastAndPresentDay = date =>
  date.isBefore(
    moment()
      .add(1, 'days')
      .startOf('day')
  )

const PrisonersUnaccountedForSearch = ({
  handleDateChange,
  date,
  handlePeriodChange,
  period,
  sortOrder,
  setColumnSort,
  numberOfPrisoners,
  reloadPage,
}) => (
  <Container>
    <SearchContainer>
      <GridRow>
        <GridCol setWidth="one-quarter" className="no-print">
          <WhereaboutsDatePicker handleDateChange={handleDateChange} date={date} shouldShowDay={pastAndPresentDay} />
        </GridCol>
        <GridCol setWidth="one-quarter">
          <FullWidthSelect
            className="no-print"
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

            {showPMPrisonerOption(getCurrentPeriod(), date) && (
              <option key="AFTERNOON" value="PM">
                Afternoon (PM)
              </option>
            )}
            {showEDPrisonerOption(getCurrentPeriod(), date) && (
              <option key="EVENING" value="ED">
                Evening (ED)
              </option>
            )}
          </FullWidthSelect>
        </GridCol>
        <GridCol>
          <RightAlignContainer>
            <Button className="no-print" onClick={() => window.print()}>
              Print list
            </Button>
          </RightAlignContainer>
        </GridCol>
      </GridRow>
    </SearchContainer>
    <LeadParagraph mb={3}>
      <span className="print-only">
        {getLongDateFormat(date)} - {period}
      </span>
      <DummyLink className="no-print" {...linkOnClick(() => reloadPage(true))}>
        Reload page
      </DummyLink>
    </LeadParagraph>
    <GridRow>
      <GridCol setWidth="one-quarter">
        <SortLov
          sortColumns={[LAST_NAME, CELL_LOCATION, ACTIVITY]}
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

PrisonersUnaccountedForSearch.propTypes = {
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  reloadPage: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
  sortOrder: PropTypes.shape({ orderColumn: PropTypes.string, orderDirection: PropTypes.string }).isRequired,
  numberOfPrisoners: PropTypes.number.isRequired,
}

export default PrisonersUnaccountedForSearch
