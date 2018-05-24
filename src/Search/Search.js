import React, { Component } from 'react';
import '../index.scss';
import './search.scss';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

class Search extends Component {
  render () {
    const housingLocations = this.props.locations ? this.props.locations.map((kw, optionIndex) => {
      return <option key={`housinglocation_option_${optionIndex}_${kw.locationId}`} value={kw.locationPrefix}>{kw.description || kw.locationPrefix}</option>;
    }) : [];

    const locationSelect = (
      <div className="pure-u-md-7-12">
        <label className="form-label" htmlFor="housing-location-select">Select Location</label>

        <select id="housing-location-select" name="housing-location-select" className="form-control"
          value={this.props.housingLocation}
          onChange={this.props.handleLocationChange}>
          {housingLocations}
        </select></div>);

    const periodSelect = (
      <div className="pure-u-md-3-12">
        <label className="form-label" htmlFor="period-select">Choose period</label>

        <select id="period-select" name="period-select" className="form-control"
          value={this.props.period}
          onChange={this.props.handlePeriodChange}>
          <option key="AM" value="AM">Morning (AM)</option>
          <option key="PM" value="PM">Afternoon (PM)</option>
          <option key="ED" value="ED">Evening (ED)</option>
        </select></div>);

    return (<div className="pure-u-md-9-12">
      <h1 className="heading-large">Manage offender whereabouts</h1>
      <div className="pure-u-md-12-12 searchForm">
        <div className="pure-u-md-10-12 padding-bottom">   {locationSelect} </div>

        <div className="pure-u-md-10-12 padding-top padding-bottom">
          <div className="pure-u-md-4-12 padding-right">
            <label className="form-label" htmlFor="search-date">Date</label>
            <input type="text" className="form-control dateInput" id="search-date" name="date" value={this.props.date} onChange={this.props.handleDateChange}/>
          </div>

          {periodSelect}
        </div>

        <div className="padding-top-large padding-bottom-large">
          <button className="button" onClick={() => { this.props.handleSearch(this.props.history);}}>Continue</button>
        </div>
      </div>
    </div>);
  }
}
Search.propTypes = {
  history: PropTypes.object,
  handleSearch: PropTypes.func.isRequired,
  handleLocationChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string,
  period: PropTypes.string,
  activity: PropTypes.string,
  location: PropTypes.string,
  locations: PropTypes.array,
  activities: PropTypes.array
};

const SearchWithRouter = withRouter(Search);

export { Search };
export default SearchWithRouter;
