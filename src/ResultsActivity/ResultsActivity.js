import React, { Component } from 'react'
import './index.scss'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { withRouter } from 'react-router'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { isToday, properCaseName, getEventDescription, stripAgencyPrefix } from '../utils'
import DatePickerInput from '../DatePickerInput'
import { getOffenderLink } from '../links'
import OtherActivitiesView from '../OtherActivityListView'
import Flags from '../Flags/Flags'

class ResultsActivity extends Component {
  static displayBack() {
    return (
      <div className="padding-top no-print">
        <Link id="back_to_menu_link" title="Back" className="link backlink" to="/whereaboutssearch">
          <img className="back-triangle" src="/images/BackTriangle.png" alt="" width="6" height="10" /> Back
        </Link>
      </div>
    )
  }

  static olderThan7Days(date) {
    const searchDate = moment(date, 'DD/MM/YYYY')
    const days = moment().diff(searchDate, 'day')
    return days > 7
  }

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
        {isToday(date) && (
          <button
            id="printButton"
            className="button greyButton rightHandSide"
            type="button"
            onClick={() => {
              handlePrint()
            }}
          >
            <img className="print-icon" src="/images/Printer_icon.png" height="23" width="20" alt="Print icon" /> Print
            list
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
        <th className="straightPrint checkbox-header">
          <div>
            <span>Pay</span>
          </div>
        </th>
        <th className="straightPrint checkbox-header">
          <div>
            <span>Other</span>
          </div>
        </th>
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
      activityData.map((mainEvent, index) => (
        <tr key={mainEvent.offenderNo} className="row-gutters">
          <td className="row-gutters">
            <a target="_blank" rel="noopener noreferrer" className="link" href={getOffenderLink(mainEvent.offenderNo)}>
              {properCaseName(mainEvent.lastName)}, {properCaseName(mainEvent.firstName)}
            </a>
          </td>
          <td className="row-gutters">{stripAgencyPrefix(mainEvent.cellLocation, agencyId)}</td>
          <td className="row-gutters">{mainEvent.offenderNo}</td>
          <td>{Flags.AlertFlags(mainEvent.alertFlags, mainEvent.cata, 'flags')}</td>
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
          <td className="no-padding checkbox-column">
            <div className="multiple-choice whereaboutsCheckbox">
              {/* Disable pay/other for Part 1 */}
              <label className="whereabouts-label" htmlFor={`col1_${index}`}>
                Pay
              </label>
              <input id={`col1_${index}`} type="checkbox" name="ch1" disabled />
            </div>
          </td>
          <td className="no-padding checkbox-column">
            <div className="multiple-choice whereaboutsCheckbox">
              <label className="whereabouts-label" htmlFor={`col2_${index}`}>
                Other
              </label>
              <input id={`col2_${index}`} type="checkbox" name="ch2" disabled />
            </div>
          </td>
        </tr>
      ))

    return (
      <div className="results-activity">
        {ResultsActivity.displayBack()}
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
