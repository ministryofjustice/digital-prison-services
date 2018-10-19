import React, { Component } from 'react';
import '../index.scss';
import '../lists.scss';
import '../App.scss';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { getHoursMinutes, properCaseName, isToday, stripAgencyPrefix, getEventDescription } from "../utils";
import DatePickerInput from "../DatePickerInput";
import moment from 'moment';
import { Link } from "react-router-dom";
import { getOffenderLink } from "../links";
import OtherActivitiesView from "../OtherActivityListView";


class ResultsHouseblock extends Component {
  displayBack () {
    return (<div className="padding-top no-print"><Link id={`back_to_selection_link`} title="Back to selection screen link" className="link backlink" to="/whereaboutssearch" >
      <img className="back-triangle" src="/images/BackTriangle.png" alt="" width="6" height="10"/> Back</Link></div>);
  }

  olderThan7Days () {
    const { date } = this.props;
    const searchDate = moment(date, 'DD/MM/YYYY');
    const days = moment().diff(searchDate, "day");

    return days > 7;
  }

  sortableColumn (heading, field) {
    const { sortOrder, getHouseblockList, orderField } = this.props;
    let triangleImage = '';

    if (sortOrder === 'ASC') {
      triangleImage = (<a className="sortableLink" id={heading + '-sort-asc'} href="#" onClick={() => {
        getHouseblockList(field, 'DESC');
      }}><img src="/images/Triangle_asc.png" height="8" width="15"/></a>);
    } else if (sortOrder === 'DESC') {
      triangleImage = (<a className="sortableLink" id={heading + '-sort-desc'} href="#" onClick={() => {
        getHouseblockList(field, 'ASC');
      }}><img src="/images/Triangle_desc.png" height="8" width="15"/></a>);
    }

    return orderField !== field ?
      <a className="sortableLink" id={heading + '-sortable-column'} href="#" onClick={() => {
        getHouseblockList(field, 'ASC');
      }}>{heading}</a> :
      <div>{heading} {triangleImage}</div>;
  }

  render () {
    const {
      agencyId,
      date,
      currentSubLocation,
      handleSubLocationChange,
      subLocations,
      handleDateChange,
      period,
      handlePeriodChange,
      handlePrint,
      houseblockData,
      currentLocation,
      update
    } = this.props;

    const subLocationOptions = (subLocations) => {
      if (!subLocations) {
        return <option key="housinglocation_option_All" value="--">All</option>;
      }

      return [
        <option key="housinglocation_option_All" value="--">All</option>,
        ...(subLocations.map((loc) => (<option key={`housinglocation_option_${loc}`} value={loc}>{loc}</option>)))
      ];
    };

    const locationSelect = (
      <div className="pure-u-md-1-3">
        <label className="form-label" htmlFor="housing-location-select">Select sub-location</label>

        <select
          id="housing-location-select"
          name="housing-location-select"
          className="form-control"
          value={currentSubLocation}
          onChange={handleSubLocationChange}>{subLocationOptions(subLocations)}</select>
      </div>);

    const dateSelect = (
      <div className="pure-u-md-1-6 padding-left padding-right">
        <label className="form-label" htmlFor="search-date">Date</label>
        <DatePickerInput
          handleDateChange={handleDateChange}
          additionalClassName="dateInputResults"
          value={date}
          inputId="search-date"/>
      </div>);

    const periodSelect = (
      <div className="pure-u-md-1-6">
        <label className="form-label" htmlFor="period-select">Choose period</label>

        <select
          id="period-select"
          name="period-select"
          className="form-control"
          value={period}
          onChange={handlePeriodChange}>
          <option key="MORNING" value="AM">Morning (AM)</option>
          <option key="AFTERNOON" value="PM">Afternoon (PM)</option>
          <option key="EVENING" value="ED">Evening (ED)</option>
        </select>
      </div>);

    const buttons = (<div id="buttons" className="pure-u-md-12-12 padding-bottom">
      {isToday(date) &&
      <button id="printButton" className="button greyButton rightHandSide" type="button" onClick={() => {
        handlePrint();
      }}><img className="print-icon" src="/images/Printer_icon.png" height="23" width="20"/> Print list</button>
      }
    </div>);

    const headings = (<tr>
      <th className="straight width15">{this.sortableColumn('Name', 'lastName')}</th>
      <th className="straight width10">{this.sortableColumn('Location', 'cellLocation')}</th>
      <th className="straight width10">NOMS&nbsp;ID</th>
      <th className="straight width15">Activity</th>
      <th className="straight">Other activities</th>
      <th className="straightPrint no-display"><div><span>Unlocked</span></div></th>
      <th className="straightPrint no-display"><div><span>Gone</span></div></th>
      <th className="checkbox-column checkbox-header no-print"><div><span>Pay</span></div></th>
      <th className="checkbox-column checkbox-header no-print"><div><span>Other</span></div></th>
    </tr>);

    const readOnly = this.olderThan7Days();

    const offenders = houseblockData && houseblockData.map((row, index) => {
      const anyActivity = row.activity || row.others[0];

      return (
        <tr key={anyActivity.offenderNo} className="row-gutters">
          <td className="row-gutters"><a target="_blank" className="link" href={getOffenderLink(anyActivity.offenderNo)}
          >{properCaseName(anyActivity.lastName)}, {properCaseName(anyActivity.firstName)}</a>
          </td>
          <td className="row-gutters">{stripAgencyPrefix(anyActivity.cellLocation, agencyId)}</td>
          <td className="row-gutters">{anyActivity.offenderNo}</td>
          <td className="row-gutters small-font">{row.activity &&
          `${getEventDescription(row.activity)} ${getHoursMinutes(row.activity.startTime)}`
          }</td>
          <td className="row-gutters small-font">
            <OtherActivitiesView offenderMainEvent={row} />
          </td>
          <td className="no-padding checkbox-column no-display">
            <div className="multiple-choice whereaboutsCheckbox">
              <input id={'col1_' + index} type="checkbox" name="ch1" disabled={readOnly}/>
              <label htmlFor={'col1_' + index} />
            </div>
          </td>
          <td className="no-padding checkbox-column no-display">
            <div className="multiple-choice whereaboutsCheckbox">
              <input id={'col2_' + index} type="checkbox" name="ch2" disabled={readOnly}/>
              <label htmlFor={'col2_' + index} />
            </div>
          </td>
          <td className="no-padding checkbox-column no-print">
            <div className="multiple-choice whereaboutsCheckbox">
              {/*Disable pay/other for Part 1*/}
              <input id={'col3_' + index} type="checkbox" name="ch3" disabled /> {/*onChange={(event) => this.props.handlePay(anyActivity, event)}*/}
              <label htmlFor={'col3_' + index} />
            </div>
          </td>
          <td className="no-padding checkbox-column no-print">
            <div className="multiple-choice whereaboutsCheckbox">
              <input id={'col4_' + index} type="checkbox" name="ch4" disabled /> {/*onChange={(event) => this.props.showPaymentReasonModal(anyActivity, event)}*/}
              <label htmlFor={'col4_' + index} />
            </div>
          </td>
        </tr>
      );
    });

    return (<div className="results-houseblock">
      {this.displayBack()}
      <h1 className="heading-large whereabouts-title no-print">{currentLocation}</h1>
      <form className="no-print">
        <div>
          {locationSelect}
          {dateSelect}
          {periodSelect}
          <button id="updateButton" className="button greyButton margin-left margin-top" type="button" onClick={() => {
            update();
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
  agencyId: PropTypes.string,
  currentLocation: PropTypes.string,
  currentSubLocation: PropTypes.string,
  getHouseblockList: PropTypes.func.isRequired,
  history: PropTypes.object,
  handleDateChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handlePrint: PropTypes.func.isRequired,
  handleSubLocationChange: PropTypes.func.isRequired,
  handlePay: PropTypes.func.isRequired,
  date: PropTypes.string,
  period: PropTypes.string,
  houseblockData: PropTypes.array,
  subLocations: PropTypes.array,
  orderField: PropTypes.string,
  sortOrder: PropTypes.string,
  showPaymentReasonModal: PropTypes.func,
  update: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
};

const ResultsHouseblockWithRouter = withRouter(ResultsHouseblock);

export { ResultsHouseblock };
export default ResultsHouseblockWithRouter;
