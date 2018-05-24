import React, { Component } from 'react';
import '../index.scss';
import './index.scss';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

class ResultsHouseblock extends Component {
  buildTableForRender () {
    const offenders = this.props.list.map((a, index) => {
      return (
        <tr key={a.offenderNo} className="row-gutters">
          <td className="row-gutters"><a target="_blank" className="link"
            href={getOffenderLink(a.offenderNo)}>{properCaseName(a.lastName)}, {properCaseName(a.firstName)}</a>
          </td>
          <td className="row-gutters">{a.offenderNo}</td>
          <td className="row-gutters">{a.internalLocationDesc}</td>
          <td className="row-gutters">{renderDate(a.confirmedReleaseDate)}</td>
          <td className="row-gutters">{a.crsaClassification || '--'}</td>
          <td className="row-gutters">{this.getKeyworkerDisplay(a.staffId, a.keyworkerDisplay, a.numberAllocated)}</td>
        </tr>
      );
    });
    return offenders;
  }

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
          <option key="MORNING" value="AM">Morning (AM)</option>
          <option key="AFTERNOON" value="PM">Afternoon (PM)</option>
          <option key="EVENING" value="ED">Evening (ED)</option>
        </select></div>);

    const offenders = ''; //this.buildTableForRender();

    return (<div className="pure-u-md-9-12">
      <h1 className="heading-large">Placeholder Location name **</h1>
      <div className="pure-u-md-12-12 searchForm">
        <div className="pure-u-md-10-12 padding-bottom"> {locationSelect} </div>

        <div className="pure-u-md-10-12 padding-top padding-bottom">
          <div className="pure-u-md-4-12 padding-right">
            <label className="form-label" htmlFor="search-date">Date</label>
            <input type="text" className="form-control dateInput" id="search-date" name="date" value={this.props.date} onChange={this.props.handleDateChange}/>
          </div>
          {periodSelect}
        </div>

        <div className="padding-top-large padding-bottom-large">
          <button className="button" onClick={() => { this.props.handleSearch(this.props.history);}}>Save changes</button>
        </div>
      </div>
      <div className="padding-bottom-40">
        <table className="row-gutters">
          <thead>
            <tr>
              <th className="rotate">
                <div><span>Name</span></div>
              </th>
              <th>Location</th>
              <th>NOMS ID</th>
              <th>Main activity</th>
              <th>Other activities</th>
              <th>Unlocked</th>
              <th>Gone</th>
              <th>Received</th>
              <th>Attend</th>
              <th>Don't attend</th>
            </tr>
          </thead>
          <tbody>{offenders}</tbody>
        </table>
      </div>
    </div>);
  }
}
ResultsHouseblock.propTypes = {
  history: PropTypes.object,
  handleSearch: PropTypes.func.isRequired,
  handleLocationChange: PropTypes.func.isRequired,
  date: PropTypes.string,
  period: PropTypes.string,
  activity: PropTypes.string,
  location: PropTypes.string,
  locations: PropTypes.array,
  activities: PropTypes.array
};

const ResultsHouseblockWithRouter = withRouter(ResultsHouseblock);

export { ResultsHouseblock };
export default ResultsHouseblockWithRouter;
