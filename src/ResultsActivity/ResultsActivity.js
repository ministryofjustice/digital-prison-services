import React, { Component } from 'react';
import './index.scss';
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
import { getOffenderLink } from "../links";

class ResultsActivity extends Component {
  static displayBack () {
    return (<div className="padding-top no-print"><Link id={`back_to_menu_link`} title="Back" className="link backlink" to="/whereaboutssearch" >
      <img className="back-triangle" src="/images/BackTriangle.png" alt="" width="6" height="10"/> Back</Link></div>);
  }

  getActivityName () {
    const filter = this.props.activities.filter(a => a.locationId === Number(this.props.activity));
    return filter && filter.length > 0 && filter[0].userDescription;
  }

  static isToday (date) {
    if (date === 'Today') {
      return true;
    }
    const searchDate = moment(date, 'DD/MM/YYYY');
    return searchDate.isSame(moment(), "day");
  }

  static olderThan7Days (date) {
    const searchDate = moment(date, 'DD/MM/YYYY');
    const days = moment().diff(searchDate, "day");
    return days > 7;
  }

  static getDescription (event) {
    if (event.event === 'PA') {
      return event.comment;
    }
    if (event.comment) {
      return event.eventDescription + ' - ' + event.comment;
    }
    return event.eventDescription;
  }

  static eventCancelled (event) {
    return event.event === 'VISIT' && event.eventStatus === 'CANC';
  }

  static otherEvent (event, index) {
    const text = `${ResultsActivity.getDescription(event)} ${getHoursMinutes(event.startTime)}`;
    const key = `${event.offenderNo}_${index}`;

    if (ResultsActivity.eventCancelled(event)) {
      return <li key={key}>{text} <span className="cancelled">(cancelled)</span></li>;
    } else {
      return <li key={key}>{text}</li>;
    }
  }


  render () {
    const dateSelect = (
      <div className="pure-u-md-2-12 padding-right">
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

        <select id="period-select" name="period-select" className="form-control" value={this.props.period} onChange={this.props.handlePeriodChange}>
          <option key="MORNING" value="AM">Morning (AM)</option>
          <option key="AFTERNOON" value="PM">Afternoon (PM)</option>
          <option key="EVENING" value="ED">Evening (ED)</option>
        </select>
      </div>);

    const buttons = (<div id="buttons" className="pure-u-md-12-12 padding-bottom">
      {ResultsActivity.isToday(this.props.date) &&
      <button id="printButton" className="button greyButton rightHandSide" type="button" onClick={() => {
        this.props.handlePrint();
      }}><img className="print-icon" src="/images/Printer_icon.png" height="23" width="20"/> Print list</button>
      }
    </div>);

    const headings = (<tr>
      <th className="straight width15">Name</th>
      <th className="straight width10">Location</th>
      <th className="straight width10">NOMS&nbsp;ID</th>
      <th className="straight"> Activity</th>
      <th className="straight">Other activities</th>
      <th className="straightPrint checkbox-header">
        <div><span>Pay</span></div>
      </th>
      <th className="straightPrint checkbox-header">
        <div><span>Other</span></div>
      </th>
    </tr>);

    //Disabled until whereabouts v2
    //const readOnly = this.olderThan7Days(this.props.date);

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

    const renderMainEvent = event => {
      if (ResultsActivity.eventCancelled(event)) {
        return (<td className="row-gutters">{ResultsActivity.getDescription(event)}<span className="cancelled"> (cancelled)</span></td>);
      } else {
        return (<td className="row-gutters">{ResultsActivity.getDescription(event)}</td>);
      }
    };

    const offenders = this.props.activityData && this.props.activityData.map((mainEvent, index) => {
      return (
        <tr key={mainEvent.offenderNo} className="row-gutters">
          <td className="row-gutters"><a target="_blank" className="link" href={getOffenderLink(mainEvent.offenderNo)}
          >{properCaseName(mainEvent.lastName)}, {properCaseName(mainEvent.firstName)}</a>
          </td>
          <td className="row-gutters">{stripAgencyPrefix(mainEvent.cellLocation, this.props.agencyId)}</td>
          <td className="row-gutters">{mainEvent.offenderNo}</td>
          {renderMainEvent(mainEvent)}
          <td className="row-gutters small-font">{(mainEvent.eventsElsewhere) &&
          <ul>{mainEvent.eventsElsewhere.map((event, index) => ResultsActivity.otherEvent(event, index))}</ul>
          }</td>
          <td className="no-padding checkbox-column"><div className="multiple-choice whereaboutsCheckbox">
            {/*Disable pay/other for Part 1*/}
            <input id={'col1_' + index} type="checkbox" name="ch1" disabled /> {/*onChange={(event) => this.props.handlePay(mainActivity, event)}*/}
            <label htmlFor={'col1_' + index} /></div></td>
          <td className="no-padding checkbox-column">
            <div className="multiple-choice whereaboutsCheckbox">
              <input id={'col2_' + index} type="checkbox" name="ch2" disabled /> {/*onChange={(event) => this.props.showPaymentReasonModal(mainActivity, event)}*/}
              <label htmlFor={'col2_' + index} />
            </div>
          </td>
        </tr>
      );
    });

    const date = this.props.date === 'Today' ?
      moment().format('dddd Do MMMM') :
      moment(this.props.date, "DD/MM/YYYY").format('dddd Do MMMM');

    return (<div className="pure-u-md-11-12 results-activity">
      {ResultsActivity.displayBack()}
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
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string,
  period: PropTypes.string,
  activityData: PropTypes.array,
  agencyId: PropTypes.string,
  activity: PropTypes.string.isRequired,
  activities: PropTypes.array,
  getActivityList: PropTypes.func.isRequired,
  handlePay: PropTypes.func.isRequired,
  showPaymentReasonModal: PropTypes.func.isRequired
};

const ResultsActivityWithRouter = withRouter(ResultsActivity);

export { ResultsActivity };
export default ResultsActivityWithRouter;
