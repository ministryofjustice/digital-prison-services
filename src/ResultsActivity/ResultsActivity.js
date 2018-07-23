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

class ResultsActivity extends Component {
  displayBack () {
    return (<div className="padding-top no-print"><Link id={`back_to_menu_link`} title="Back" className="link backlink" to="/whereaboutssearch" >
      <img className="back-triangle" src="/images/BackTriangle.png" alt="" width="6" height="10"/> Back</Link></div>);
  }

  getActivityName () {
    const filter = this.props.activities.filter(a => a.locationId === Number(this.props.activity));
    return filter && filter.length > 0 && filter[0].userDescription;
  }

  isToday (date) {
    if (date === 'Today') {
      return true;
    }
    const searchDate = moment(date, 'DD/MM/YYYY');
    return searchDate.isSame(moment(), "day");
  }

  olderThan7Days (date) {
    const searchDate = moment(date, 'DD/MM/YYYY');
    const days = moment().diff(searchDate, "day");
    return days > 7;
  }

  getDescription (event) {
    if (event.event === 'PA') {
      return event.comment;
    }
    if (event.comment) {
      return event.eventDescription + ' - ' + event.comment;
    }
    return event.eventDescription;
  }

  render () {
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
      {this.isToday(this.props.date) &&
      <button id="printButton" className="button greyButton rightHandSide" type="button" onClick={() => {
        this.props.handlePrint();
      }}><img className="print-icon" src="/images/Printer_icon.png" height="23" width="20"/> Print list</button>
      }
    </div>);

    const headings = (<tr>
      <th className="straight">Name</th>
      <th className="straight">Location</th>
      <th className="straight">NOMS&nbsp;ID</th>
      <th className="straight">Other</th>
      <th className="rotate straightPrint"><div><span>Pay</span></div></th>
      <th className="rotate straightPrint"><div><span>Other</span></div></th>
    </tr>);

    const readOnly = this.olderThan7Days(this.props.date);

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

    const offenders = this.props.activityData && this.props.activityData.map((row, index) => {
      const mainActivity = row;
      return (
        <tr key={mainActivity.offenderNo} className="row-gutters">
          <td className="row-gutters">{properCaseName(mainActivity.lastName)}, {properCaseName(mainActivity.firstName)}</td>
          <td className="row-gutters">{stripAgencyPrefix(mainActivity.cellLocation, this.props.agencyId)}</td>
          <td className="row-gutters">{mainActivity.offenderNo}</td>
          <td className="row-gutters small-font">{(row.visits || row.appointments) &&
          <ul>{row.visits && row.visits.map((e, index) => {
            return <li key={mainActivity.offenderNo + '_' + index}>{this.getDescription(e)} {getHoursMinutes(e.startTime)}</li>;
          })}
          {row.appointments && row.appointments.map((e, index) => {
            return <li key={mainActivity.offenderNo + '_' + index}>{this.getDescription(e)} {getHoursMinutes(e.startTime)}</li>;
          })}</ul>
          }</td>
          <td className="no-padding checkbox-column"><div className="multiple-choice whereaboutsCheckbox">
            <input id={'col1_' + index} type="checkbox" name="ch1" disabled={readOnly}/>
            <label htmlFor={'col1_' + index} /></div></td>
          <td className="no-padding checkbox-column">
            <div className="multiple-choice whereaboutsCheckbox">
              <input id={'col2_' + index} type="checkbox" name="ch2" disabled={readOnly} onClick={() => this.props.showNoneAttendanceModal(mainActivity)}/>
              <label htmlFor={'col2_' + index} />
            </div>
          </td>
        </tr>
      );
    });

    const date = this.props.date === 'Today' ?
      moment().format('dddd Do MMMM') :
      moment(this.props.date, "DD/MM/YYYY").format('dddd Do MMMM');

    return (<div className="pure-u-md-11-12">
      {this.displayBack()}
      <h1 className="heading-large whereabouts-title">{this.getActivityName()}</h1>
      <div className="prison-title print-only">{getPrisonDescription(this.props.user)}</div>
      <div className="whereabouts-date print-only">{date} ({this.props.period})</div>
      <hr className="print-only" />
      <form className="no-print">
        <div>
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
ResultsActivity.propTypes = {
  history: PropTypes.object,
  user: PropTypes.object.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handlePrint: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string,
  period: PropTypes.string,
  activityData: PropTypes.array,
  agencyId: PropTypes.string,
  activity: PropTypes.number,
  activities: PropTypes.array,
  getActivityList: PropTypes.func.isRequired,
  showNoneAttendanceModal: PropTypes.func.isRequired
};

const ResultsActivityWithRouter = withRouter(ResultsActivity);

export { ResultsActivity };
export default ResultsActivityWithRouter;
