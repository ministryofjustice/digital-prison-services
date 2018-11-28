import React, { Component } from 'react'
import './index.scss'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { isTodayOrAfter, properCaseName, getMainEventDescription, stripAgencyPrefix, getHoursMinutes } from '../utils'
import DatePickerInput from '../DatePickerInput'
import { getOffenderLink } from '../links'
import OtherActivitiesView from '../OtherActivityListView'
import Flags from '../Flags/Flags'
import SortableColumn from '../ResultsHouseblock/SortableColumn'

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
      agencyId,
      handleDateChange,
      date,
      period,
      handlePeriodChange,
      handlePrint,
      activityData,
      getActivityList,
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

    const sortLov = () => {
      const { sortOrder, orderField, setColumnSort } = this.props

      const invokeColumnSortWithEventData = event => {
        const [field, order] = event.target.value.split('_')
        setColumnSort(field, order)
      }
      return (
        <div className="pure-u-md-1-4">
          <label className="form-label" htmlFor="sort-select">
            Order the list
          </label>
          <select
            id="sort-select"
            name="sort-select"
            className="form-control"
            onChange={invokeColumnSortWithEventData}
            value={`${orderField}_${sortOrder}`}
          >
            <option key="lastName_ASC" value="lastName_ASC">
              Name (A-Z)
            </option>
            <option key="lastName_DESC" value="lastName_DESC">
              Name (Z-A)
            </option>
            <option key="cellLocation_ASC" value="cellLocation_ASC">
              Location (1-X)
            </option>
            <option key="cellLocation_DESC" value="cellLocation_DESC">
              Location (X-1)
            </option>
            <option key="activity_ASC" value="activity_ASC">
              Activity name (A-Z)
            </option>
            <option key="activity_DESC" value="activity_DESC">
              Activity name (Z-A)
            </option>
          </select>
        </div>
      )
    }

    const headings = () => {
      const { sortOrder, orderField, setColumnSort } = this.props
      return (
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
          <th className="straight width5">Info</th>
          <th className="straight width15">
            <SortableColumn
              heading="Activity"
              field="activity"
              sortOrder={sortOrder}
              setColumnSort={setColumnSort}
              orderField={orderField}
            />
          </th>
          <th className="straight">Other activities</th>
        </tr>
      )
    }
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
      activityData.map(mainEvent => (
        <tr key={mainEvent.offenderNo} className="row-gutters">
          <td className="row-gutters">
            <a target="_blank" rel="noopener noreferrer" className="link" href={getOffenderLink(mainEvent.offenderNo)}>
              {properCaseName(mainEvent.lastName)}, {properCaseName(mainEvent.firstName)}
            </a>
          </td>
          <td className="row-gutters">{stripAgencyPrefix(mainEvent.cellLocation, agencyId)}</td>
          <td className="row-gutters">{mainEvent.offenderNo}</td>
          <td>{Flags.AlertFlags(mainEvent.alertFlags, mainEvent.category, 'flags')}</td>
          {renderMainEvent(mainEvent)}
          <td className="row-gutters small-font last-text-column-padding">
            {
              <OtherActivitiesView
                offenderMainEvent={{
                  ...mainEvent,
                  others: mainEvent.eventsElsewhere,
                }}
              />
            }
          </td>
        </tr>
      ))

    return (
      <div className="results-activity">
        {this.displayBack()}
        <h1 className="heading-large whereabouts-title">{this.getActivityName()}</h1>
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
          {sortLov()}
        </form>
        <div>
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
  agencyId: PropTypes.string.isRequired,
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
