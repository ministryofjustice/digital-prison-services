import React, { Component } from 'react';
import '../index.scss';
import './search.scss';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import DatePickerInput from "../DatePickerInput";
import ValidationErrors from "../ValidationError";

class Search extends Component {
  constructor () {
    super();
    this.onActivityChange = this.onActivityChange.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
  }

  onActivityChange (event) {
    if (event.target.value !== '--') {
      this.props.handleLocationChange({ target: { value: '--' } });
    }
    this.props.handleActivityChange(event);
  }

  onLocationChange (event) {
    if (event.target.value !== '--') {
      this.props.handleActivityChange({ target: { value: '--' } });
    }
    this.props.handleLocationChange(event);
  }

  render () {
    const loaded = this.props.loaded;

    const housingLocations = this.props.locations ? this.props.locations.map((loc, optionIndex) => {
      return <option key={`housinglocation_option_${loc}`} value={loc}>{loc}</option>;
    }) : [];

    const activityLocations = this.props.activities ? this.props.activities.map((loc, optionIndex) => {
      return <option key={`activity_option_${loc.locationId}`} value={loc.locationId}>{loc.userDescription}</option>;
    }) : [];

    const locationSelect = (
      <div className="pure-u-md-12-12">
        <label className="form-label" htmlFor="housing-location-select">Select Housing block location</label>

        <select id="housing-location-select" name="housing-location-select" className="form-control"
          value={this.props.currentLocation}
          onChange={this.onLocationChange}>
          <option key="choose" value="--">-- Select --</option>
          {housingLocations}
        </select></div>);

    const activitySelect = (
      <div className="pure-u-md-12-12">
        <label className="form-label" htmlFor="activity-select">Select Activity location</label>

        <select id="activity-select" name="activity-select" className="form-control"
          value={this.props.activity}
          disabled={!loaded}
          onChange={this.onActivityChange}>
          <option key="choose" value="--">-- Select --</option>
          {activityLocations}
        </select></div>);

    const dateSelect = (<div className="pure-u-md-5-12">
      <label className="form-label" htmlFor="search-date">Date</label>
      <DatePickerInput
        handleDateChange={this.props.handleDateChange}
        additionalClassName="dateInput"
        value={this.props.date}
        inputId="search-date"/>
    </div>);

    const periodSelect = (
      <div className="pure-u-md-5-12 ">
        <label className="form-label" htmlFor="period-select">Choose period</label>

        <select id="period-select" name="period-select" className="form-control"
          value={this.props.period}
          onChange={this.props.handlePeriodChange}>
          <option key="MORNING" value="AM">Morning (AM)</option>
          <option key="AFTERNOON" value="PM">Afternoon (PM)</option>
          <option key="EVENING" value="ED">Evening (ED)</option>
        </select></div>);

    return (<div className="pure-u-md-9-12">
      <h1 className="heading-large">Manage offender whereabouts</h1>
      <ValidationErrors validationErrors={this.props.validationErrors} fieldName={'searchForm'}/>
      <form id="searchForm" name="searchForm" className="pure-u-md-12-12 searchForm">
        <div className="pure-u-md-5-12 padding-bottom"> {locationSelect} </div>
        <div className="pure-u-md-1-12 orDiv ">or</div>
        <div className="pure-u-md-5-12 padding-bottom"> {activitySelect} </div>

        <div className="pure-u-md-6-12 padding-top padding-bottom">
          {dateSelect}
          <div className="pure-u-md-2-12"/>
          {periodSelect}
        </div>

        <div className="padding-top-large padding-bottom-large">
          <button id="continue-button" className="button" type="button"
            disabled = {!loaded}
            onClick={() => {
              this.props.onSearch(this.props.history);
            }}>Continue</button>
        </div>
      </form>
    </div>);
  }
}
Search.propTypes = {
  history: PropTypes.object,
  validationErrors: PropTypes.object,
  onSearch: PropTypes.func.isRequired,
  handleLocationChange: PropTypes.func.isRequired,
  handleActivityChange: PropTypes.func.isRequired,
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
