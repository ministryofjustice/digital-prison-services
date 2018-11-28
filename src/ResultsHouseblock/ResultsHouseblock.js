import React, { Component } from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { getHoursMinutes, properCaseName, isTodayOrAfter, stripAgencyPrefix, getMainEventDescription, setListSizeClass } from '../utils'
import DatePickerInput from '../DatePickerInput'
import { getOffenderLink } from '../links'
import OtherActivitiesView from '../OtherActivityListView'
import SortableColumn from './SortableColumn'
import Flags from '../Flags/Flags'

class ResultsHouseblock extends Component {
  displayBack = () => {
    const { resetErrorDispatch } = this.props
    return (
      <div className="padding-top no-print">
        <Link
          id="back_to_selection_link"
          title="Back to selection screen link"
          className="link backlink"
          to="/whereaboutssearch"
          onClick={() => resetErrorDispatch()}
        >
          <img className="back-triangle" src="/images/BackTriangle.png" alt="Back icon" width="6" height="10" /> Back
        </Link>
      </div>
    )
  }

  olderThan7Days = () => {
    const { date } = this.props
    const searchDate = moment(date, 'DD/MM/YYYY')
    const days = moment().diff(searchDate, 'day')

    return days > 7
  }

  render() {
    const {
      agencyId,
      date,
      currentSubLocation,
      handleSubLocationChange,
      subLocations,
      handleDateChange,
      period,
      handlePeriodChange,
      handlePrint,
      houseblockData,
      currentLocation,
      update,
    } = this.props

    const renderLocationOptions = locationOptions => {
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
        ...locationOptions.map(loc => (
          <option key={`housinglocation_option_${loc}`} value={loc}>
            {loc}
          </option>
        )),
      ]
    }

    const locationSelect = (
      <div className="pure-u-md-1-3">
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
      <div className="pure-u-md-1-6 padding-left padding-right">
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
        <div className="pure-u-md-1-4 margin-top-small margin-bottom-large">
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
          <th className="straightPrint no-display">
            <div>
              <span>Unlocked</span>
            </div>
          </th>
          <th className="straightPrint no-display">
            <div>
              <span>Gone</span>
            </div>
          </th>
        </tr>
      )
    }

    const readOnly = this.olderThan7Days()

    const offenders =
      houseblockData &&
      houseblockData.map((row, index) => {
        const anyActivity = row.activity || row.others[0]

        return (
          <tr key={anyActivity.offenderNo} className="row-gutters">
            <td className="row-gutters">
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="link"
                href={getOffenderLink(anyActivity.offenderNo)}
              >
                {properCaseName(anyActivity.lastName)}, {properCaseName(anyActivity.firstName)}
              </a>
            </td>
            <td className="row-gutters">{stripAgencyPrefix(anyActivity.cellLocation, agencyId)}</td>
            <td className="row-gutters">{anyActivity.offenderNo}</td>
            <td>{Flags.AlertFlags(row.alertFlags, row.category, 'flags')}</td>
            <td className="row-gutters small-font">
              {row.activity && `${getHoursMinutes(row.activity.startTime)} - ${getMainEventDescription(row.activity)}`}
            </td>
            <td className="row-gutters small-font">
              <OtherActivitiesView offenderMainEvent={row} />
            </td>
            <td className="no-padding checkbox-column no-display">
              <div className="multiple-choice whereaboutsCheckbox">
                <label className="whereabouts-label" htmlFor={`col1_${index}`}>
                  Unlocked
                </label>
                <input id={`col1_${index}`} type="checkbox" name="ch1" disabled={readOnly} />
              </div>
            </td>
            <td className="no-padding checkbox-column no-display">
              <div className="multiple-choice whereaboutsCheckbox">
                <label className="whereabouts-label" htmlFor={`col2_${index}`}>
                  Gone
                </label>
                <input id={`col2_${index}`} type="checkbox" name="ch2" disabled={readOnly} />
              </div>
            </td>
          </tr>
        )
      })

    return (
      <div className="results-houseblock">
        {this.displayBack()}
        <h1 className="heading-large whereabouts-title">{currentLocation}</h1>
        <hr className="print-only" />
        <form className="no-print">
          <div>
            {locationSelect}
            {dateSelect}
            {periodSelect}
            <button
              id="updateButton"
              className="button greyButton margin-left margin-top"
              type="button"
              onClick={() => {
                update()
              }}
            >
              Update
            </button>
          </div>
          <hr />
          {buttons}
          {sortLov()}
        </form>
        <div className={setListSizeClass(offenders)}>
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
ResultsHouseblock.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handlePrint: PropTypes.func.isRequired,
  handleSubLocationChange: PropTypes.func.isRequired,
  agencyId: PropTypes.string.isRequired,
  currentLocation: PropTypes.string.isRequired,
  currentSubLocation: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  houseblockData: PropTypes.arrayOf(
    PropTypes.shape({
      activity: PropTypes.shape({
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
        comment: PropTypes.string.isRequired,
      }),
      others: PropTypes.arrayOf(
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
  subLocations: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  orderField: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
}

const ResultsHouseblockWithRouter = withRouter(ResultsHouseblock)

export { ResultsHouseblock }
export default ResultsHouseblockWithRouter
