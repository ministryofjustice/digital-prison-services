import React, { Component } from 'react';
import '../index.scss';
import './search.scss';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import DatePickerInput from "../DatePickerInput";
import ValidationErrors from "../ValidationError";

class Search extends Component {
  render () {
    const loaded = this.props.loaded;

    const locationOptions = (locations) => locations ? locations.reduce(
      (options, loc) => {
        options.push(<option key={`housinglocation_option_${loc}`} value={loc}>{loc}</option>);
        return options;
      },
      [(<option key="choose" value="--">&mdash; Select &mdash;</option>)]
    ) : [];

    const activityOptions = (activities) => activities ? activities.reduce(
      (options, loc) => {
        options.push(<option key={`activity_option_${loc.locationId}`} value={loc.locationId}>{loc.userDescription}</option>);
        return options;
      },
      [(<option key="choose" value="--">&mdash; Select &mdash;</option>)]
    ) : [];

    const dateSelect = (
      <React.Fragment>
        <label className="form-label bold" htmlFor="search-date">Date</label>
        <DatePickerInput
          handleDateChange={this.props.handleDateChange}
          value={this.props.date}
          inputId="search-date"/>
      </React.Fragment>
    );

    const periodSelect = (
      <React.Fragment>
        <label className="form-label bold" htmlFor="period-select">Period</label>

        <select
          id="period-select"
          name="period-select"
          className="form-control"
          value={this.props.period}
          onChange={this.props.handlePeriodChange}>
          <option key="MORNING" value="AM">Morning (AM)</option>
          <option key="AFTERNOON" value="PM">Afternoon (PM)</option>
          <option key="EVENING" value="ED">Evening (ED)</option>
        </select>
      </React.Fragment>
    );


    const locationSelect = (
      <div className="pure-g padding-bottom-large">
        <div className="pure-u-md-4-5">
          <div className="padding-left-large">
            <legend className="heading-medium">Search by housing</legend>
            <label className="form-label padding-top" htmlFor="housing-location-select">Housing</label>
            <select
              id="housing-location-select"
              name="housing-location-select"
              className="form-control"
              value={this.props.currentLocation}
              onChange={this.props.onLocationChange}>
              {locationOptions(this.props.locations)}
            </select>
            <div className="padding-top-large padding-bottom-40">
              <button
                id="continue-housing"
                className="button width50"
                type="button"
                disabled={!loaded}
                onClick={() => {
                  this.props.onSearch(this.props.history);
                }}>Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    const activitySelect = (
      <div className="pure-g padding-bottom-large">
        <div className="pure-u-md-4-5">
          <div className="padding-left-large">
            <legend className="heading-medium">Search by activity</legend>
            <label className="form-label padding-top" htmlFor="activity-select">Activity</label>
            <select
              id="activity-select"
              name="activity-select"
              className="form-control"
              value={this.props.activity}
              disabled={!loaded}
              onChange={this.props.onActivityChange}>
              {activityOptions(this.props.activities)}
            </select>
            <div className="padding-top-large padding-bottom-40">
              <button
                id="continue-activity"
                className="button width50"
                type="button"
                disabled={!loaded}
                onClick={() => {
                  this.props.onSearch(this.props.history);
                }}>Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <React.Fragment>
        <h1 className="heading-large">Search prisoner whereabouts</h1>
        <hr/>
        <ValidationErrors validationErrors={this.props.validationErrors} fieldName={'searchForm'}/>
        <form id="searchForm" name="searchForm" className="searchForm">
          <div className="padding-top padding-bottom-large">
            <div className="pure-u-md-1-6">
              <div className="padding-right">
                {dateSelect}
              </div>
            </div>
            <div className="pure-u-md-1-6">
              {periodSelect}
            </div>
          </div>

          <div className="top-gutter">
            <fieldset className="pure-u-md-5-12">
              {locationSelect}
            </fieldset>
            <div className="pure-u-md-1-12"/>
            <fieldset className="pure-u-md-5-12">
              {activitySelect}
            </fieldset>
          </div>
        </form>
      </React.Fragment>);
  }
}

Search.propTypes = {
  history: PropTypes.object,
  validationErrors: PropTypes.object,
  onSearch: PropTypes.func.isRequired,
  onLocationChange: PropTypes.func.isRequired,
  onActivityChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string,
  period: PropTypes.string,
  activity: PropTypes.string,
  currentLocation: PropTypes.string,
  locations: PropTypes.array,
  activities: PropTypes.array,
  loaded: PropTypes.bool
};

const SearchWithRouter = withRouter(Search);

export { Search };
export default SearchWithRouter;
