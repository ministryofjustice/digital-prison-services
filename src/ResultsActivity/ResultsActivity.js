import React, { Component } from 'react'
import './index.scss'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { isTodayOrAfter, properCaseName, getEventDescription, stripAgencyPrefix } from '../utils'
import DatePickerInput from '../DatePickerInput'
import { getOffenderLink } from '../links'
import OtherActivitiesView from '../OtherActivityListView'
import Flags from '../Flags/Flags'

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
      handleSearch,
      history,
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

    const headings = (
      <tr>
        <th className="straight width15">Name</th>
        <th className="straight width10">Location</th>
        <th className="straight width10">NOMS&nbsp;ID</th>
        <th className="straight width5">Info</th>
        <th className="straight"> Activity</th>
        <th className="straight">Other activities</th>
      </tr>
    )

    // Disabled until whereabouts v2
    // const readOnly = this.olderThan7Days(this.props.date);
    const renderMainEvent = event => {
      if (ResultsActivity.eventCancelled(event)) {
        return (
          <td className="row-gutters">
            {getEventDescription(event)}
            <span className="cancelled"> (cancelled)</span>
          </td>
        )
      }
      return <td className="row-gutters">{getEventDescription(event)}</td>
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
        <h1 className="heading-large whereabouts-title no-print">{this.getActivityName()}</h1>
        <form className="no-print">
          <div>
            {dateSelect}
            {periodSelect}
            <button
              id="updateButton"
              className="button greyButton margin-left margin-top"
              type="button"
              onClick={() => {
                handleSearch(history)
              }}
            >
              Update
            </button>
          </div>
          <hr />
          {buttons}
        </form>
        <div>
          <table className="row-gutters">
            <thead>{headings}</thead>
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
  handleSearch: PropTypes.func.isRequired,
  handlePrint: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  agencyId: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
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
}

const ResultsActivityWithRouter = withRouter(ResultsActivity)

export { ResultsActivity }
export default ResultsActivityWithRouter
