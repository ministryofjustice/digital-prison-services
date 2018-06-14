import React, { Component } from 'react';
import '../index.scss';
import './index.scss';
import '../App.scss';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { getHoursMinutes, properCaseName } from "../stringUtils";
import DatePickerInput from "../DatePickerInput";
import { getPrisonDescription } from '../stringUtils';
import moment from 'moment';

class ResultsHouseblock extends Component {
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

    let activityTitle;
    switch (this.props.period) {
      case 'AM': activityTitle = 'AM';
        break;
      case 'PM': activityTitle = 'PM';
        break;
      case 'ED': activityTitle = 'ED';
        break;
    }
    const headings = (<tr>
      <th className="straight">{this.sortableColumn('Name', 'lastName')}</th>
      <th className="straight">{this.sortableColumn('Location', 'cellLocation')}</th>
      <th className="straight">NOMS&nbsp;ID</th>
      <th className="straight no-print">Main activity</th>
      <th className="straight print-only">{activityTitle}</th>
      <th className="straight">Other&nbsp;activities</th>
      <th className="rotate"><div><span>Unlocked</span></div></th>
      <th className="rotate"><div><span>Gone</span></div></th>
      <th className="rotate checkbox-column no-print"><div><span>Received</span></div></th>
      <th className="rotate checkbox-column no-print"><div><span>Attend</span></div></th>
      <th className="rotate checkbox-column no-print"><div><span>Don't attend</span></div></th>
    </tr>);

    const readOnly = this.olderThan7Days();

    const offenders = this.props.houseblockData && this.props.houseblockData.map((row, index) => {
      const mainActivity = row.activity;
      return (
        <tr key={mainActivity.offenderNo} className="row-gutters">
          <td className="row-gutters">{properCaseName(mainActivity.lastName)}, {properCaseName(mainActivity.firstName)}</td>
          <td className="row-gutters">{mainActivity.cellLocation}</td>
          <td className="row-gutters">{mainActivity.offenderNo}</td>
          <td className="row-gutters">{mainActivity.comment}</td>
          <td className="row-gutters small-font">{row.others &&
          <ul>{row.others.map((e, index) => {
            return <li key={mainActivity.offenderNo + '_' + index}>{e.comment} {getHoursMinutes(e.startTime)}</li>;
          })}</ul>
          }</td>
          <td className="no-padding checkbox-column"><div className="multiple-choice whereaboutsCheckbox">
            <input id={'col1_' + index} type="checkbox" name="ch1" disabled={readOnly}/>
            <label htmlFor={'col1_' + index} /></div></td>
          <td className="no-padding checkbox-column"><div className="multiple-choice whereaboutsCheckbox">
            <input id={'col2_' + index} type="checkbox" name="ch2" disabled={readOnly}/>
            <label htmlFor={'col2_' + index} /></div></td>
          <td className="no-padding checkbox-column no-print"><img src="/images/GreenTick.png" height="35" width="35"/></td>
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
      <h1 className="heading-large whereabouts-title">{this.props.currentLocation}</h1>
      <div className="prison-title print-only">{getPrisonDescription(this.props.user)}</div>
      <div className="whereabouts-date print-only">{date}</div>
      <hr className="print-only" />
      <form className="no-print">
        <div>
          {locationSelect}
          {dateSelect}
          {periodSelect}
          <button id="updateButton" className="button greyButton margin-left margin-top" type="button" onClick={() => {
            this.props.handleSearch(this.props.history);
          }}>Update
          </button>
        </div>
        <hr/>
        {buttons}
      </form>
      <div>
        <table className="row-gutters">
          <thead>{headings}</thead>
          <tbody>{offenders}</tbody>
        </table>
        {offenders.length === 0 ?
          <div className="font-small padding-top-large padding-bottom padding-left">No cells found</div> :
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
  orderField: PropTypes.string,
  sortOrder: PropTypes.string
};

const ResultsHouseblockWithRouter = withRouter(ResultsHouseblock);

export { ResultsHouseblock };
export default ResultsHouseblockWithRouter;
