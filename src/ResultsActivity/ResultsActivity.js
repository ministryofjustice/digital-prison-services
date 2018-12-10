import React, { Component } from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { isTodayOrAfter, getMainEventDescription, getHoursMinutes, getListSizeClass, getLongDateFormat } from '../utils'
import DatePickerInput from '../DatePickerInput'
import OtherActivitiesView from '../OtherActivityListView'
import Flags from '../Flags/Flags'
import SortableColumn from '../tablesorting/SortableColumn'
import SortLov from '../tablesorting/SortLov'
import { ACTIVITY, CELL_LOCATION, LAST_NAME } from '../tablesorting/sortColumns'
import OffenderName from '../OffenderName'
import OffenderLink from '../OffenderLink'
import Location from '../Location'

class ResultsActivity extends Component {
  static eventCancelled(event) {
    return event.event === 'VISIT' && event.eventStatus === 'CANC'
  }

  getActivityName() {
    const { activities, activity } = this.props
    return (
      activities
        .filter(a => a.locationId === Number(activity))
        .map(a => a.userDescription)
        .find(a => !!a) || null
    )
  }

  displayBack() {
    const { resetErrorDispatch } = this.props
    return (
      <div className="padding-top no-print">
        <Link
          id="back_to_menu_link"
          title="Back"
          className="link backlink"
          to="/whereaboutssearch"
          onClick={() => resetErrorDispatch()}
        >
          <img className="back-triangle" src="/images/BackTriangle.png" alt="" width="6" height="10" /> Back
        </Link>
      </div>
    )
  }

  render() {
    const {
      handleDateChange,
      date,
      period,
      handlePeriodChange,
      handlePrint,
      activityData,
      getActivityList,
      sortOrder,
      orderField,
      setColumnSort,
    } = this.props

    const dateSelect = (
      <div className="pure-u-md-1-6 padding-right">
        <label className="form-label" htmlFor="search-date">
          Date
        </label>
        <DatePickerInput
          handleDateChange={handleDateChange}
          additionalClassName="dateInputResults"
          value={date}
          inputId="search-date"
        />
      </div>
    )

    const periodSelect = (
      <div className="pure-u-md-1-6">
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

    const buttons = (
      <div id="buttons" className="pure-u-md-12-12 padding-bottom">
        {isTodayOrAfter(date) && (
          <button
            id="printButton"
            className="button"
            type="button"
            onClick={() => {
              handlePrint()
            }}
          >
            <img className="print-icon" src="/images/Printer_icon_white.png" height="23" width="20" alt="Print icon" />{' '}
            Print list
          </button>
        )}
      </div>
    )

    const headings = () => (
      <tr>
        <th className="straight width15">
          <SortableColumn
            heading="Name"
            field="lastName"
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            orderField={orderField}
          />
        </th>
        <th className="straight width10">
          <SortableColumn
            heading="Location"
            field="cellLocation"
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            orderField={orderField}
          />
        </th>
        <th className="straight width10">NOMS&nbsp;ID</th>
        <th className="straight width10">Info</th>
        <th className="straight width20">
          <SortableColumn
            heading="Activity"
            field="activity"
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            orderField={orderField}
          />
        </th>
        <th className="straight">Other activities</th>
        <th className="straightPrint checkbox-header no-display">
          <div>
            <span>Received</span>
          </div>
        </th>
      </tr>
    )

    // Disabled until whereabouts v2
    // const readOnly = this.olderThan7Days(this.props.date);
    const renderMainEvent = event => {
      const mainEventDescription = `${getHoursMinutes(event.startTime)} - ${getMainEventDescription(event)}`
      if (ResultsActivity.eventCancelled(event)) {
        return (
          <td className="row-gutters">
            {mainEventDescription}
            <span className="cancelled"> (cancelled)</span>
          </td>
        )
      }
      return <td className="row-gutters">{mainEventDescription}</td>
    }

    const offenders =
      activityData &&
      activityData.map((mainEvent, index) => (
        <tr key={mainEvent.offenderNo} className="row-gutters">
          <td className="row-gutters">
            <OffenderLink offenderNo={mainEvent.offenderNo}>
              <OffenderName firstName={mainEvent.firstName} lastName={mainEvent.lastName} />
            </OffenderLink>
          </td>
          <td className="row-gutters">
            <Location location={mainEvent.cellLocation} />
          </td>
          <td className="row-gutters">{mainEvent.offenderNo}</td>
          <td>{Flags.AlertFlags(mainEvent.alertFlags, mainEvent.category, 'flags')}</td>
          {renderMainEvent(mainEvent)}
          <td className="row-gutters last-text-column-padding">
            {
              <OtherActivitiesView
                offenderMainEvent={{
                  ...mainEvent,
                  others: mainEvent.eventsElsewhere,
                }}
              />
            }
          </td>
          <td className="no-padding checkbox-column">
            <div className="multiple-choice whereaboutsCheckbox no-display">
              <label className="whereabouts-label" htmlFor={`col1_${index}`}>
                Received
              </label>
              <input id={`col1_${index}`} type="checkbox" name="ch1" disabled />
            </div>
          </td>
        </tr>
      ))

    return (
      <div className="results-activity">
        {this.displayBack()}
        <h1 className="heading-large whereabouts-title">{this.getActivityName()}</h1>
        <span className="whereabouts-date print-only">
          - {getLongDateFormat(date)} - {period}
        </span>
        <hr className="print-only" />
        <form className="no-print">
          <div>
            {dateSelect}
            {periodSelect}
            <button
              id="updateButton"
              className="button greyButton margin-left margin-top"
              type="button"
              onClick={() => {
                getActivityList()
              }}
            >
              Update
            </button>
          </div>
          <hr />
          {buttons}
          <SortLov
            sortColumns={[LAST_NAME, CELL_LOCATION, ACTIVITY]}
            sortColumn={orderField}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
          />
        </form>
        <div className={getListSizeClass(offenders)}>
          <table className="row-gutters">
            <thead>{headings()}</thead>
            <tbody>{offenders}</tbody>
          </table>
          {!offenders || offenders.length === 0 ? (
            <div className="font-small padding-top-large padding-bottom padding-left">No prisoners found</div>
          ) : (
            <div className="padding-top"> {buttons} </div>
          )}
        </div>
      </div>
    )
  }
}

ResultsActivity.propTypes = {
  getActivityList: PropTypes.func.isRequired,
  handlePrint: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  activityData: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      eventId: PropTypes.number,
      cellLocation: PropTypes.string.isRequired,
      eventsElsewhere: PropTypes.array,
      event: PropTypes.string.isRequired,
      eventType: PropTypes.string,
      eventDescription: PropTypes.string.isRequired,
      eventStatus: PropTypes.string,
      comment: PropTypes.string.isRequired,
    })
  ).isRequired,
  activity: PropTypes.string.isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({ locationId: PropTypes.number.isRequired, userDescription: PropTypes.string.isRequired })
      .isRequired
  ).isRequired,
  setColumnSort: PropTypes.func.isRequired,
  orderField: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
}

const ResultsActivityWithRouter = withRouter(ResultsActivity)

export { ResultsActivity }
export default ResultsActivityWithRouter
