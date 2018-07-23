import React, { Component } from 'react';
import '../index.scss';
import '../lists.scss';
import '../App.scss';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { getHoursMinutes, properCaseName } from "../stringUtils";
import DatePickerInput from "../DatePickerInput";
import { getPrisonDescription } from '../stringUtils';
import moment from 'moment';
import { Link } from "react-router-dom";

class ResultsHouseblock extends Component {
  displayBack () {
    return (<div className="padding-top no-print"><Link id={`back_to_selection_link`} title="Back to selection screen link" className="link backlink" to="/whereaboutssearch" >
      <img className="back-triangle" src="/images/BackTriangle.png" alt="" width="6" height="10"/> Back</Link></div>);
  }

  isToday () {
    if (this.props.date === 'Today') {
      return true;
    }
    const searchDate = moment(this.props.date, 'DD/MM/YYYY');
    return searchDate.isSame(moment(), "day");
  }

  olderThan7Days () {
    const searchDate = moment(this.props.date, 'DD/MM/YYYY');
    const days = moment().diff(searchDate, "day");
    return days > 7;
  }

  sortableColumn (heading, orderField) {
    let triangleImage = '';
    if (this.props.sortOrder === 'ASC') {
      triangleImage = (<a className="sortableLink" id={heading + '-sort-asc'} href="#" onClick={() => {
        this.props.getHouseblockList(orderField, 'DESC');
      }}><img src="/images/Triangle_asc.png" height="8" width="15"/></a>);
    } else if (this.props.sortOrder === 'DESC') {
      triangleImage = (<a className="sortableLink" id={heading + '-sort-desc'} href="#" onClick={() => {
        this.props.getHouseblockList(orderField, 'ASC');
      }}><img src="/images/Triangle_desc.png" height="8" width="15"/></a>);
    }

    return this.props.orderField !== orderField ?
      <a className="sortableLink" id={heading + '-sortable-column'} href="#" onClick={() => {
        this.props.getHouseblockList(orderField, 'ASC');
      }}>{heading}</a> :
      <div>{heading} {triangleImage}</div>;
  }

  getDescription (event) {
    if (event.eventType === 'PRISON_ACT') {
      return event.comment;
    }
    if (event.comment) {
      return event.eventDescription + ' - ' + event.comment;
    }
    return event.eventDescription;
  }

  render () {
    const housingLocations = this.props.locations ? this.props.locations.map((loc, optionIndex) => {
      return <option key={`housinglocation_option_${loc}`}>{loc}</option>;
    }) : [];

    const locationSelect = (
      <div className="pure-u-md-4-12">
        <label className="form-label" htmlFor="housing-location-select">Select sub-location</label>

        <select id="housing-location-select" name="housing-location-select" className="form-control"
          value={this.props.currentLocation}
          onChange={this.props.handleLocationChange}>
          {housingLocations}
        </select></div>);

    const dateSelect = (
      <div className="pure-u-md-2-12 padding-left padding-right">
        <label className="form-label" htmlFor="search-date">Date</label>
        <DatePickerInput
          handleDateChange={this.props.handleDateChange}
          additionalClassName="dateInputResults"
          value={this.props.date}
          inputId="search-date"/>
      </div>);

    const periodSelect = (
      <div className="pure-u-md-2-12">
        <label className="form-label" htmlFor="period-select">Choose period</label>

        <select id="period-select" name="period-select" className="form-control"
          value={this.props.period}
          onChange={this.props.handlePeriodChange}>
          <option key="MORNING" value="AM">Morning (AM)</option>
          <option key="AFTERNOON" value="PM">Afternoon (PM)</option>
          <option key="EVENING" value="ED">Evening (ED)</option>
        </select>
      </div>);

    const buttons = (<div id="buttons" className="pure-u-md-12-12 padding-bottom">
      <button id="saveButton" className="button" type="button" onClick={() => {
        this.props.handleSave(this.props.history);
      }}>Save changes</button>
      {this.isToday() &&
      <button id="printButton" className="button greyButton rightHandSide" type="button" onClick={() => {
        this.props.handlePrint();
      }}><img className="print-icon" src="/images/Printer_icon.png" height="23" width="20"/> Print list</button>
      }
    </div>);

    const headings = (<tr>
      <th className="straight">{this.sortableColumn('Name', 'lastName')}</th>
      <th className="straight">{this.sortableColumn('Location', 'cellLocation')}</th>
      <th className="straight">NOMS&nbsp;ID</th>
      <th className="straight">Activity</th>
      <th className="straight">Other</th>
      <th className="rotate straightPrint no-display"><div><span>Unlocked</span></div></th>
      <th className="rotate straightPrint no-display"><div><span>Gone</span></div></th>
      <th className="rotate checkbox-column no-print"><div><span>Attend</span></div></th>
      <th className="rotate checkbox-column no-print"><div><span>Don't attend</span></div></th>
    </tr>);

    const readOnly = this.olderThan7Days();

    const stripAgencyPrefix = (location, agency) => {
      const parts = location && location.split('-');
      if (parts && parts.length > 0) {
        const index = parts.findIndex(p => p === agency);
        if (index >= 0) {
          return location.substring(parts[index].length + 1, location.length);
        }
      }
      return location;
    };

    const offenders = this.props.houseblockData && this.props.houseblockData.map((row, index) => {
      // const mainActivity = row.activity;
      const anyActivity = row.activity ? row.activity[0] : row.others[0];
      return (
        <tr key={anyActivity.offenderNo} className="row-gutters">
          <td className="row-gutters">{`${properCaseName(anyActivity.lastName)}, ${properCaseName(anyActivity.firstName)}`}</td>
          <td className="row-gutters">{stripAgencyPrefix(anyActivity.cellLocation, this.props.agencyId)}</td>
          <td className="row-gutters">{anyActivity.offenderNo}</td>
          <td className="row-gutters small-font">{row.activity &&
          <ul>{row.activity.map((event, index) => {
            return <li key={event.offenderNo + '_' + index}>{this.getDescription(event)} {getHoursMinutes(event.startTime)}</li>;
          })}</ul>
          }</td>
          <td className="row-gutters small-font">{row.others &&
          <ul>{row.others.map((event, index) => {
            return <li key={event.offenderNo_ + 'others_' + index}>{this.getDescription(event)} {getHoursMinutes(event.startTime)}</li>;
          })}</ul>
          }</td>
          <td className="no-padding checkbox-column no-display"><div className="multiple-choice whereaboutsCheckbox">
            <input id={'col1_' + index} type="checkbox" name="ch1" disabled={readOnly}/>
            <label htmlFor={'col1_' + index} /></div></td>
          <td className="no-padding checkbox-column no-display"><div className="multiple-choice whereaboutsCheckbox">
            <input id={'col2_' + index} type="checkbox" name="ch2" disabled={readOnly}/>
            <label htmlFor={'col2_' + index} /></div></td>
          <td className="no-padding checkbox-column no-print"><div className="multiple-choice whereaboutsCheckbox">
            <input id={'col3_' + index} type="checkbox" name="ch3" disabled={readOnly}/>
            <label htmlFor={'col3_' + index} /></div></td>
          <td className="no-padding checkbox-column no-print"><div className="multiple-choice whereaboutsCheckbox">
            <input id={'col4_' + index} type="checkbox" name="ch4" disabled={readOnly}/>
            <label htmlFor={'col4_' + index} /></div></td>
        </tr>
      );
    });

    const date = this.props.date === 'Today' ?
      moment().format('dddd Do MMMM') :
      moment(this.props.date, "DD/MM/YYYY").format('dddd Do MMMM');

    return (<div className="pure-u-md-11-12">
      {this.displayBack()}
      <h1 className="heading-large whereabouts-title">{this.props.currentLocation}</h1>
      <div className="prison-title print-only">{getPrisonDescription(this.props.user)}</div>
      <div className="whereabouts-date print-only">{date} ({this.props.period}) </div>
      <hr className="print-only" />
      <form className="no-print">
        <div>
          {locationSelect}
          {dateSelect}
          {periodSelect}
          <button id="updateButton" className="button greyButton margin-left margin-top" type="button" onClick={() => {
            this.props.handleSearch(this.props.history);
          }}>Update</button>
        </div>
        <hr/>
        {buttons}
      </form>
      <div>
        <table className="row-gutters">
          <thead>{headings}</thead>
          <tbody>{offenders}</tbody>
        </table>
        {!offenders || offenders.length === 0 ?
          <div className="font-small padding-top-large padding-bottom padding-left">No prisoners found</div> :
          <div className="padding-top"> { buttons } </div>
        }
      </div>
    </div>);
  }
}
ResultsHouseblock.propTypes = {
  history: PropTypes.object,
  user: PropTypes.object.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handlePrint: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleLocationChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string,
  period: PropTypes.string,
  houseblockData: PropTypes.array,
  currentLocation: PropTypes.string,
  locations: PropTypes.array,
  getHouseblockList: PropTypes.func.isRequired,
  agencyId: PropTypes.string,
  orderField: PropTypes.string,
  sortOrder: PropTypes.string
};

const ResultsHouseblockWithRouter = withRouter(ResultsHouseblock);

export { ResultsHouseblock };
export default ResultsHouseblockWithRouter;
