import React, { Component } from 'react'
import '../index.scss'
import './search.scss'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { withRouter } from 'react-router'
import { BLUE, LINK_HOVER_COLOUR, LINK_COLOUR } from 'govuk-colours'
import styled from 'styled-components'
import Link from '@govuk-react/link'
import { FONT_SIZE, BREAKPOINTS } from '@govuk-react/constants'
import ErrorSummary from '@govuk-react/error-summary'
import WhereaboutsDatePicker from '../DatePickers/WhereaboutsDatePicker'
import { isBeforeToday, isAfterToday, getCurrentPeriod } from '../utils'
import routePaths from '../routePaths'
import { onHandleErrorClick } from '../final-form-govuk-helpers'

const StatsLink = styled(Link)`
  font-size: ${FONT_SIZE.SIZE_22};
  color: ${LINK_COLOUR};
  cursor: pointer;
  text-decoration: underline;
  display: inline-block;
  margin-bottom: 10px;

  &:hover {
    color: ${LINK_HOVER_COLOUR};
  }
`
export const AttendanceButtonsContainer = styled('div')`
  margin-right: 5em;
  margin-top: 1.4em;
  width: 50%;
  text-align: left;

  @media (max-width: ${BREAKPOINTS.LARGESCREEN}) {
    width: 75%;
  }

  @media screen and (min-width: ${BREAKPOINTS.DESKTOP}) {
    width: 35%;
    float: right;
    text-align: right;
  }
`

export const PrisonersUnaccountedForCTA = styled('div')`
  display: inline-block;
`

class Search extends Component {
  showPrisonersUnaccountedForCTA = () => {
    const { period: selectedPeriod, date } = this.props
    const actualPeriod = getCurrentPeriod()

    if (isBeforeToday(date)) return true
    if (isAfterToday(date)) return false
    if (selectedPeriod === 'AM') return true
    if (selectedPeriod === 'PM') return actualPeriod === 'PM' || actualPeriod === 'ED'
    return actualPeriod === 'ED'
  }

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
                <option key={`housinglocation_option_${loc.key}`} value={loc.key}>
                  {loc.name}
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

    const periodSelect = (
      <>
        <label className="form-label" htmlFor="period-select">
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
      </>
    )

    const locationSelect = (
      <div className="pure-g padding-bottom-large">
        <div className="pure-u-md-4-5">
          <div className="padding-left-large">
            <legend className="heading-medium">Residential location</legend>
            <label className="form-label padding-top" htmlFor="housing-location-select">
              Choose a location
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
            <legend className="heading-medium">Activity/appointment location</legend>
            <label className="form-label padding-top" htmlFor="activity-select">
              Choose a location
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

    const searchError = []
    if (validationErrors) {
      searchError.push({ targetName: 'housing-location-select', text: 'Please select location or activity' })
    }

    return (
      <>
        {Boolean(validationErrors && Object.entries(validationErrors).length > 0) && (
          <span id="validation-message">
            <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={searchError} />
          </span>
        )}
        <form id="searchForm" name="searchForm" className="searchForm">
          <div className="padding-top padding-bottom-large clearfix">
            <div className="pure-u-md-1-6">
              <div className="padding-right">
                <WhereaboutsDatePicker handleDateChange={handleDateChange} date={date} />
              </div>
            </div>
            <div className="pure-u-md-1-6">{periodSelect}</div>
            <AttendanceButtonsContainer>
              <StatsLink href="/appointments" buttonColour={BLUE}>
                View all appointments
              </StatsLink>
              {this.showPrisonersUnaccountedForCTA() && (
                <PrisonersUnaccountedForCTA>
                  <StatsLink
                    buttonColour={BLUE}
                    onClick={() => history.push(routePaths.prisonersUnaccountedFor)}
                    data-qa="prisoners-unaccounted-for"
                  >
                    View prisoners unaccounted for
                  </StatsLink>
                </PrisonersUnaccountedForCTA>
              )}
              <StatsLink href="/manage-prisoner-whereabouts/attendance-reason-statistics" buttonColour={BLUE}>
                View attendance reason statistics
              </StatsLink>
            </AttendanceButtonsContainer>
          </div>

          <div className="top-gutter">
            <fieldset className="pure-u-md-5-12 fieldset">{locationSelect}</fieldset>
            <div className="pure-u-md-1-12" />
            <fieldset className="pure-u-md-5-12 fieldset">{activitySelect}</fieldset>
          </div>
        </form>
      </>
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
  locations: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
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
