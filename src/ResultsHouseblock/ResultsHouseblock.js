import React, { Component } from 'react';
import '../index.scss';
import './index.scss';
import '../App.scss';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

class ResultsHouseblock extends Component {
  buildTableForRender () {
    const offenders = this.props.houseblockData && this.props.houseblockData.map((a, index) => {
      return (
        <tr key={a.offenderNo} className="row-gutters">
          <td className="row-gutters">{properCaseName(a.lastName)}, {properCaseName(a.firstName)}</td>
          <td className="row-gutters">{a.cellLocation}</td>
          <td className="row-gutters">{a.offenderNo}</td>
          <td className="row-gutters">{a.eventDescription}</td>
          <td className="row-gutters">{a.crsaClassification || '--'}</td>
          <td><input type="checkbox" /></td>
        </tr>
      );
    });
    return offenders;
  }

  render () {
    const housingLocations = this.props.locations ? this.props.locations.map((loc, optionIndex) => {
      return <option key={`housinglocation_option_${loc}`} value={loc}>{loc}</option>;
    }) : [];

    const locationSelect = (
      <div className="pure-u-md-7-12">
        <label className="form-label" htmlFor="housing-location-select">Select Location</label>

        <select id="housing-location-select" name="housing-location-select" className="form-control"
          value={this.props.currentLocation}
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
        </select>
      </div>);

    const offenders = this.buildTableForRender();

    return (<div className="pure-u-md-10-12">
      <h1 className="heading-large">{this.props.currentLocation}</h1>
      <div className="pure-u-md-12-12 searchForm">
        <div className="pure-u-md-4-12 padding-bottom"> {locationSelect} </div>

        <div className="pure-u-md-4-12 padding-right">
          <label className="form-label" htmlFor="search-date">Date</label>
          <input type="text" className="form-control dateInput" id="search-date" name="date" value={this.props.date} onChange={this.props.handleDateChange}/>
        </div>
        {periodSelect}
        <hr />
        <div className="pure-u-md-3-12 padding-bottom">
          <button className="button" onClick={() => { this.props.handleSearch(this.props.history);}}>Save changes</button>
        </div>
        <div className="pure-u-md-3-12 padding-bottom">
          <button className="button greyButton" style={{ float: 'right' }}>Print list</button>
        </div>
        <hr style={{ clear: 'right' }}/>
      </div>
      <div className="padding-bottom-40">
        <table className="row-gutters">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>NOMS ID</th>
              <th>Main activity</th>
              <th>Other activities</th>
              <th className="rotate">
                <div><span>Unlocked</span></div>
              </th>
              <th className="rotate">
                <div><span>Gone</span></div>
              </th>
              <th className="rotate">
                <div><span>Received</span></div>
              </th>
              <th className="rotate">
                <div><span>Attend</span></div>
              </th>
              <th className="rotate">
                <div><span>Don't attend</span></div>
              </th>
            </tr>
          </thead>
          <tbody>{offenders}</tbody>
        </table>
        {offenders.length === 0 && <div className="font-small padding-top-large padding-bottom padding-left">No cells found</div>}
      </div>
    </div>);
  }
}
ResultsHouseblock.propTypes = {
  history: PropTypes.object,
  handleSearch: PropTypes.func.isRequired,
  handleLocationChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string,
  period: PropTypes.string,
  houseblockData: PropTypes.array,
  currentLocation: PropTypes.string,
  locations: PropTypes.array
};

const ResultsHouseblockWithRouter = withRouter(ResultsHouseblock);

export { ResultsHouseblock };
export default ResultsHouseblockWithRouter;
