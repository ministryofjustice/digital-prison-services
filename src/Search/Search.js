import React, { Component, Fragment } from 'react'
import '../index.scss'
import './search.scss'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { withRouter } from 'react-router'
import DatePickerInput from '../DatePickerInput'
import ValidationErrors from '../ValidationError'

class Search extends Component {
  render() {
    const {
      loaded,
      handleDateChange,
      date,
      period,
      handlePeriodChange,
      currentLocation,
      onLocationChange,
      locations,
      onSearch,
      history,
      activity,
      activities,
      onActivityChange,
      validationErrors,
    } = this.props

    const renderLocationOptions = locationOptions =>
      locationOptions
        ? locationOptions.reduce(
            (options, loc) => {
              options.push(
                <option key={`housinglocation_option_${loc}`} value={loc}>
                  {loc}
                </option>
              )
              return options
            },
            [
              <option key="choose" value="--">
                &mdash; Select &mdash;
              </option>,
            ]
          )
        : []

    const renderActivityOptions = activityOptions =>
      activityOptions
        ? activityOptions.reduce(
            (options, loc) => {
              options.push(
                <option key={`activity_option_${loc.locationId}`} value={loc.locationId}>
                  {loc.userDescription}
                </option>
              )
              return options
            },
            [
              <option key="choose" value="--">
                &mdash; Select &mdash;
              </option>,
            ]
          )
        : []

    const dateSelect = (
      <Fragment>
        <label className="form-label bold" htmlFor="search-date">
          Date
        </label>
        <DatePickerInput handleDateChange={handleDateChange} value={date} inputId="search-date" />
      </Fragment>
    )

    const periodSelect = (
      <Fragment>
        <label className="form-label bold" htmlFor="period-select">
          Period
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
      </Fragment>
    )

    const locationSelect = (
      <div className="pure-g padding-bottom-large">
        <div className="pure-u-md-4-5">
          <div className="padding-left-large">
            <legend className="heading-medium">Search by housing</legend>
            <label className="form-label padding-top" htmlFor="housing-location-select">
              Housing
            </label>
            <select
              id="housing-location-select"
              name="housing-location-select"
              className="form-control"
              value={currentLocation}
              onChange={onLocationChange}
            >
              {renderLocationOptions(locations)}
            </select>
            <div className="padding-top-large padding-bottom-40">
              <button
                id="continue-housing"
                className="button width50"
                type="button"
                disabled={!loaded}
                onClick={() => {
                  onSearch(history)
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    )

    const activitySelect = (
      <div className="pure-g padding-bottom-large">
        <div className="pure-u-md-4-5">
          <div className="padding-left-large">
            <legend className="heading-medium">Search by activity</legend>
            <label className="form-label padding-top" htmlFor="activity-select">
              Activity
            </label>
            <select
              id="activity-select"
              name="activity-select"
              className="form-control"
              value={activity}
              disabled={!loaded}
              onChange={onActivityChange}
            >
              {renderActivityOptions(activities)}
            </select>
            <div className="padding-top-large padding-bottom-40">
              <button
                id="continue-activity"
                className="button width50"
                type="button"
                disabled={!loaded}
                onClick={() => {
                  onSearch(history)
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    )

    return (
      <Fragment>
        <h1 className="heading-large">Search prisoner whereabouts</h1>
        <hr />
        <ValidationErrors validationErrors={validationErrors} fieldName="searchForm" />
        <form id="searchForm" name="searchForm" className="searchForm">
          <div className="padding-top padding-bottom-large">
            <div className="pure-u-md-1-6">
              <div className="padding-right">{dateSelect}</div>
            </div>
            <div className="pure-u-md-1-6">{periodSelect}</div>
          </div>

          <div className="top-gutter">
            <fieldset className="pure-u-md-5-12">{locationSelect}</fieldset>
            <div className="pure-u-md-1-12" />
            <fieldset className="pure-u-md-5-12">{activitySelect}</fieldset>
          </div>
        </form>
      </Fragment>
    )
  }
}

Search.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onLocationChange: PropTypes.func.isRequired,
  onActivityChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  activity: PropTypes.string.isRequired,
  currentLocation: PropTypes.string,
  locations: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({ locationId: PropTypes.number.isRequired, userDescription: PropTypes.string.isRequired })
  ).isRequired,
  loaded: PropTypes.bool.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  validationErrors: PropTypes.shape({ searchForm: PropTypes.string }),
}

Search.defaultProps = {
  currentLocation: '',
  validationErrors: {},
}

const SearchWithRouter = withRouter(Search)

export { Search }
export default SearchWithRouter
