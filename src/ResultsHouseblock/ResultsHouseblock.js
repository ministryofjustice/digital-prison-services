import React, { Component } from 'react'
import Link from '@govuk-react/link'
import { Link as RouterLink } from 'react-router-dom'
import Button from '@govuk-react/button'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import moment from 'moment'
import styled from 'styled-components'
import { FONT_SIZE } from '@govuk-react/constants'
import { LINK_HOVER_COLOUR, LINK_COLOUR } from 'govuk-colours'
import {
  isAfterToday,
  getHoursMinutes,
  isWithinNextTwoWorkingDays,
  getMainEventDescription,
  getListSizeClass,
  getLongDateFormat,
} from '../utils'
import OtherActivitiesView from '../OtherActivityListView'
import SortableColumn from '../tablesorting/SortableColumn'
import AlertFlags from '../AlertFlags'
import SortLov from '../tablesorting/SortLov'
import { LAST_NAME, CELL_LOCATION, ACTIVITY } from '../tablesorting/sortColumns'
import OffenderName from '../OffenderName'
import OffenderLink from '../OffenderLink'
import Location from '../Location'
import WhereaboutsDatePicker from '../DatePickers/WhereaboutsDatePicker'
import TotalResults from '../Components/ResultsTable/elements/TotalResults'
import AttendanceOptions from '../Attendance/AttendanceOptions'
import { linkOnClick } from '../helpers'

const ManageResults = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  @media print {
    justify-content: flex-end;
  }
`

const StackedTotals = styled.div`
  display: flex;
  flex-direction: column;
  text-align: right;
`

const HideForPrint = styled.span`
  @media print {
    display: none;
  }
`

export const PrintButton = styled(Button)`
  min-width: 8em;
  margin-bottom: 20px;
  img {
    margin-right: 0.5em;
  }
`

const TitleLinkContainer = styled('div')`
  margin: -15px 0 15px;
`

export const PrintLink = styled(Link)`
  font-size: ${FONT_SIZE.SIZE_16};
  color: ${LINK_COLOUR};
  cursor: pointer;
  text-decoration: underline;
  display: inline-block;
  margin: 0 0 15px -10px;
  position: relative;
  padding: 0.5em 0 0.5em 38px;
  background: url('/images/Printer_icon.png') no-repeat 10px 50%;
  background-size: 16px 18px;

  &:hover {
    color: ${LINK_HOVER_COLOUR};
  }
`

class ResultsHouseblock extends Component {
  componentWillUnmount() {
    const { resetErrorDispatch } = this.props
    resetErrorDispatch()
  }

  olderThan7Days = () => {
    const { date } = this.props
    const searchDate = moment(date, 'DD/MM/YYYY')
    const days = moment().diff(searchDate, 'day')

    return days > 7
  }

  render() {
    const {
      date,
      currentSubLocation,
      handleSubLocationChange,
      handleWingStatusChange,
      subLocations,
      handleDateChange,
      period,
      handlePeriodChange,
      handlePrint,
      redactedPrintState,
      houseblockData,
      update,
      sortOrder,
      orderField,
      setColumnSort,
      agencyId,
      setHouseblockOffenderAttendance,
      resetErrorDispatch,
      setErrorDispatch,
      raiseAnalyticsEvent,
      handleError,
      showModal,
      activityName,
      totalAttended,
    } = this.props

    const renderLocationOptions = (locationOptions) => {
      if (!locationOptions) {
        return (
          <option key="housinglocation_option_All" value="--">
            All
          </option>
        )
      }

      return [
        <option key="housinglocation_option_All" value="--">
          All
        </option>,
        ...locationOptions.map((loc) => (
          <option key={`housinglocation_option_${loc.key}`} value={loc.key}>
            {loc.name}
          </option>
        )),
      ]
    }

    const locationSelect = (
      <div>
        <label className="form-label" htmlFor="housing-location-select">
          Select sub-location
        </label>

        <select
          id="housing-location-select"
          name="housing-location-select"
          className="form-control"
          value={currentSubLocation}
          onChange={handleSubLocationChange}
        >
          {renderLocationOptions(subLocations)}
        </select>
      </div>
    )

    const dateSelect = (
      <div>
        <WhereaboutsDatePicker handleDateChange={handleDateChange} date={date} marginBottom={0} />
      </div>
    )

    const periodSelect = (
      <div>
        <label className="form-label" htmlFor="period-select">
          Choose period
        </label>

        <select
          id="period-select"
          name="period-select"
          className="form-control"
          value={period}
          onChange={handlePeriodChange}
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
        </select>
      </div>
    )

    const stayingLeavingSelect = (
      <div>
        <label className="form-label" htmlFor="period-select">
          Staying or leaving wing
        </label>

        <select
          id="staying-leaving-select"
          name="staying-leaving-select"
          className="form-control"
          onChange={handleWingStatusChange}
        >
          <option key="All" value="all">
            All
          </option>
          <option key="Staying" value="staying">
            Staying
          </option>
          <option key="Leaving" value="leaving">
            Leaving
          </option>
        </select>
      </div>
    )

    const printButton = (
      <div id="buttons" className="buttons pull-right">
        {isWithinNextTwoWorkingDays(date) && (
          <PrintLink onClick={() => handlePrint()} id="printButton" data-test="print-button">
            Print this page
          </PrintLink>
        )}
        {isWithinNextTwoWorkingDays(date) && isAfterToday(date) && (
          <>
            <br />
            <PrintLink onClick={() => handlePrint('redacted')} className="redactedPrintButton">
              Print list for general view
            </PrintLink>
          </>
        )}
      </div>
    )
    const redactedHide = redactedPrintState ? 'no-print' : 'straightPrint'
    const redactedPrint = redactedPrintState ? 'straightPrint' : 'no-print'

    const headings = () => (
      <tr>
        <th className="straight width15">
          <SortableColumn
            heading="Name"
            column={LAST_NAME}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            sortColumn={orderField}
          />
        </th>
        <th className="straight width10">
          <SortableColumn
            heading="Location"
            column={CELL_LOCATION}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            sortColumn={orderField}
          />
        </th>
        <th className="straight width10">Prison number</th>
        <th className={`straight width10 ${redactedHide}`}>Relevant alerts</th>
        <th className="straight width20">
          <SortableColumn
            heading="Activities"
            column={ACTIVITY}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            sortColumn={orderField}
          />
        </th>
        <th className="straight">Other activities</th>
        <th className={`no-display ${redactedHide}`}>
          <div>
            <span>Unlocked</span>
          </div>
        </th>
        <th className={`no-display ${redactedHide}`}>
          <div>
            <span>Gone</span>
          </div>
        </th>
        <th className="no-print">Attended</th>
      </tr>
    )

    const readOnly = this.olderThan7Days()

    const offenders =
      houseblockData &&
      houseblockData.map((offender, index) => {
        const { offenderNo, bookingId, firstName, lastName, cellLocation } = offender
        const mainActivity = offender.activities.find((activity) => activity.mainActivity)
        const { eventId, attendanceInfo, eventLocationId } = mainActivity || {}
        const offenderDetails = {
          offenderNo,
          bookingId,
          firstName,
          lastName,
          eventId,
          eventLocationId,
          offenderIndex: index,
          cellLocation,
          attendanceInfo,
        }
        const isReceived = attendanceInfo && attendanceInfo.pay && !attendanceInfo.locked
        const isPaid = attendanceInfo && attendanceInfo.pay && attendanceInfo.locked

        return (
          <tr key={offenderNo} className="row-gutters">
            <td className={`row-gutters ${redactedHide}`}>
              <OffenderLink offenderNo={offenderNo}>
                <OffenderName firstName={firstName} lastName={lastName} />
              </OffenderLink>
            </td>
            <td className={`no-display ${redactedPrint}`}>
              <OffenderLink offenderNo={offenderNo}>
                <OffenderName firstName={firstName.charAt(0)} lastName={lastName} />
              </OffenderLink>
            </td>
            <td className="row-gutters">
              <Location location={cellLocation} />
            </td>
            <td className={`row-gutters ${redactedHide}`}>{offenderNo}</td>
            <td className={`no-display ${redactedPrint}`}>{offenderNo.replace(/^.{3}/g, '***')}</td>
            <td className={redactedHide}>
              <AlertFlags alerts={offender.alertFlags} category={offender.category} />
            </td>
            <td className="row-gutters">
              {mainActivity && `${getHoursMinutes(mainActivity.startTime)} - ${getMainEventDescription(mainActivity)}`}
            </td>
            <td className="row-gutters">
              <OtherActivitiesView offenderMainEvent={offender} />
            </td>
            <td className={`no-padding checkbox-column no-display ${redactedHide}`}>
              <div className="multiple-choice whereaboutsCheckbox">
                <label className="whereabouts-label" htmlFor={`col1_${index}`}>
                  Unlocked
                </label>
                <input id={`col1_${index}`} type="checkbox" name="ch1" disabled={readOnly} />
              </div>
            </td>
            <td className={`no-padding checkbox-column no-display ${redactedHide}`}>
              <div className="multiple-choice whereaboutsCheckbox">
                <label className="whereabouts-label" htmlFor={`col2_${index}`}>
                  Gone
                </label>
                <input id={`col2_${index}`} type="checkbox" name="ch2" disabled={readOnly} />
              </div>
            </td>
            <>
              {isReceived && <td className="no-print">Received</td>}
              {isPaid && <td className="no-print">Paid</td>}
              {!isReceived && !isPaid && (
                <AttendanceOptions
                  offenderDetails={offenderDetails}
                  raiseAnalyticsEvent={raiseAnalyticsEvent}
                  resetErrorDispatch={resetErrorDispatch}
                  setErrorDispatch={setErrorDispatch}
                  handleError={handleError}
                  reloadPage={update}
                  agencyId={agencyId}
                  period={period}
                  showModal={showModal}
                  activityName={activityName}
                  setOffenderAttendance={setHouseblockOffenderAttendance}
                  date={date}
                  noPay
                />
              )}
            </>
          </tr>
        )
      })

    return (
      <div className="results-houseblock">
        <span className="whereabouts-date print-only">
          {getLongDateFormat(date)} - {period}
        </span>

        <TitleLinkContainer className="horizontal-information govuk-!-display-none-print">
          <div className="horizontal-information__item">
            <a href="/manage-prisoner-whereabouts/select-residential-location" className="govuk-link">
              Select another residential location
            </a>
          </div>
          <div className="horizontal-information__item">{printButton}</div>
        </TitleLinkContainer>

        <hr className="print-only" />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-three-quarters">
            <form className="form-background govuk-!-padding-3 govuk-!-margin-bottom-5 govuk-!-display-none-print">
              <h2 className="govuk-heading-m">View by</h2>
              <div className="horizontal-form">
                {locationSelect}
                {dateSelect}
                {periodSelect}
                {stayingLeavingSelect}
              </div>
            </form>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <StackedTotals>
              <TotalResults label="Prisoners listed:" totalResults={houseblockData.length} />
              <HideForPrint>
                <TotalResults label="Sessions attended:" totalResults={totalAttended} />
              </HideForPrint>
            </StackedTotals>

            <Link as={RouterLink} {...linkOnClick(update)} className="pull-right govuk-!-display-none-print">
              Check for updates to the list
            </Link>
          </div>
        </div>

        <ManageResults>
          <div className="pure-u-md-1-4 margin-top-small">
            <SortLov
              sortColumns={[LAST_NAME, CELL_LOCATION, ACTIVITY]}
              sortColumn={orderField}
              sortOrder={sortOrder}
              setColumnSort={setColumnSort}
            />
          </div>
        </ManageResults>
        <div className={getListSizeClass(offenders)}>
          <table className="row-gutters">
            <thead>{headings()}</thead>
            <tbody>{offenders}</tbody>
          </table>
          {!offenders || offenders.length === 0 ? (
            <div className="font-small padding-top-large padding-bottom padding-left">No prisoners found</div>
          ) : (
            <div className="padding-top">
              <div id="buttons" className="pure-u-md-12-12 padding-bottom">
                {printButton}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}
ResultsHouseblock.propTypes = {
  agencyId: PropTypes.string.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleWingStatusChange: PropTypes.func.isRequired,
  handlePrint: PropTypes.func.isRequired,
  redactedPrintState: PropTypes.bool.isRequired,
  handleSubLocationChange: PropTypes.func.isRequired,
  currentSubLocation: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  houseblockData: PropTypes.arrayOf(
    PropTypes.shape({
      activities: PropTypes.arrayOf(
        PropTypes.shape({
          offenderNo: PropTypes.string.isRequired,
          firstName: PropTypes.string.isRequired,
          lastName: PropTypes.string.isRequired,
          eventId: PropTypes.number,
          cellLocation: PropTypes.string.isRequired,
          others: PropTypes.array,
          event: PropTypes.string.isRequired,
          eventType: PropTypes.string,
          eventDescription: PropTypes.string.isRequired,
          eventStatus: PropTypes.string,
          comment: PropTypes.string,
        })
      ),
    }).isRequired
  ).isRequired,
  totalAttended: PropTypes.number.isRequired,
  subLocations: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  orderField: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setErrorDispatch: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  setHouseblockOffenderAttendance: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  activityName: PropTypes.string.isRequired,
}

const ResultsHouseblockWithRouter = withRouter(ResultsHouseblock)

export { ResultsHouseblock }
export default ResultsHouseblockWithRouter
