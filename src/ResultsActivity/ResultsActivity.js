import React, { Component } from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { getMainEventDescription, getHoursMinutes, getListSizeClass, getLongDateFormat } from '../utils'
import OtherActivitiesView from '../OtherActivityListView'
import Flags from '../Flags/Flags'
import SortableColumn from '../tablesorting/SortableColumn'
import SortLov from '../tablesorting/SortLov'
import { ACTIVITY, CELL_LOCATION, LAST_NAME } from '../tablesorting/sortColumns'
import OffenderName from '../OffenderName'
import OffenderLink from '../OffenderLink'
import Location from '../Location'
import WhereaboutsDatePicker from '../DatePickers/WhereaboutsDatePicker'
import ResultsFilter from '../Components/ResultsFilter'
import PayOptions from './elements/PayOptions'
import PayOtherForm from './elements/PayOtherForm'
import ModalContainer from '../Components/ModalContainer/ModalContainer'

class ResultsActivity extends Component {
  static eventCancelled(event) {
    return event.event === 'VISIT' && event.eventStatus === 'CANC'
  }

  constructor(props) {
    super(props)
    this.state = {
      payModalOpen: false,
      activeOffender: {
        id: undefined,
        firstName: undefined,
        lastName: undefined,
      },
    }
  }

  openModal = e => {
    const { firstName, lastName } = e.target.dataset
    this.setState({
      activeOffender: {
        id: e.target.name,
        firstName,
        lastName,
      },
      payModalOpen: true,
    })
  }

  closeModal = () => {
    // TODO: Clear the previously checked other input if form input is cancelled
    this.setState({ payModalOpen: false })
  }

  onPaySubmit = () => {
    console.log('Pay submit')
  }

  render() {
    const {
      handleDateChange,
      date,
      period,
      handlePeriodChange,
      activityData,
      getActivityList,
      sortOrder,
      orderField,
      setColumnSort,
      updateAttendanceEnabled,
      payable,
    } = this.props

    const { payModalOpen, activeOffender } = this.state

    const periodSelect = (
      <div className="pure-u-md-1-6">
        <label className="form-label" htmlFor="period-select">
          Choose period
        </label>

        <select
          id="period-select"
          name="period-select"
          className="form-control"
          value={period}
          onChange={handlePeriodChange}
        >
          <option key="MORNING" value="AM">
            Morning (AM)
          </option>
          <option key="AFTERNOON" value="PM">
            Afternoon (PM)
          </option>
          <option key="EVENING" value="ED">
            Evening (ED)
          </option>
        </select>
      </div>
    )

    const headings = () => (
      <tr>
        <th className="straight width15">
          <SortableColumn
            heading="Name"
            column={LAST_NAME}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            sortColumn={orderField}
          />
        </th>
        <th className="straight width10">
          <SortableColumn
            heading="Location"
            column={CELL_LOCATION}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            sortColumn={orderField}
          />
        </th>
        <th className="straight width10">Prison&nbsp;no.</th>
        <th className="straight width10">Info</th>
        <th className="straight width20">
          <SortableColumn
            heading="Activity"
            column={ACTIVITY}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            sortColumn={orderField}
          />
        </th>
        <th className="straight">Other activities</th>
        <th className="straightPrint checkbox-header no-display">
          <div>
            <span>Received</span>
          </div>
        </th>
        {updateAttendanceEnabled &&
          payable && (
            <React.Fragment>
              <th className="straight width10">Pay</th>
              <th className="straight width10">Other</th>
            </React.Fragment>
          )}
      </tr>
    )

    // Disabled until whereabouts v2
    // const readOnly = this.olderThan7Days(this.props.date);
    const renderMainEvent = event => {
      const mainEventDescription = `${getHoursMinutes(event.startTime)} - ${getMainEventDescription(event)}`
      if (ResultsActivity.eventCancelled(event)) {
        return (
          <td className="row-gutters">
            {mainEventDescription}
            <span className="cancelled"> (cancelled)</span>
          </td>
        )
      }
      return <td className="row-gutters">{mainEventDescription}</td>
    }

    const offenders =
      activityData &&
      activityData.map((mainEvent, index) => {
        const { offenderNo, firstName, lastName, cellLocation, alertFlags, category, eventId } = mainEvent
        const key = `${offenderNo}-${eventId}`
        return (
          <tr key={key} className="row-gutters">
            <td className="row-gutters">
              <OffenderLink offenderNo={offenderNo}>
                <OffenderName firstName={firstName} lastName={lastName} />
              </OffenderLink>
            </td>
            <td className="row-gutters">
              <Location location={cellLocation} />
            </td>
            <td className="row-gutters">{offenderNo}</td>
            <td>{Flags.AlertFlags(alertFlags, category, 'flags')}</td>
            {renderMainEvent(mainEvent)}
            <td className="row-gutters last-text-column-padding">
              {
                <OtherActivitiesView
                  offenderMainEvent={{
                    ...mainEvent,
                    others: mainEvent.eventsElsewhere,
                  }}
                />
              }
            </td>
            <td className="no-padding checkbox-column no-display">
              <div className="multiple-choice whereaboutsCheckbox">
                <label className="whereabouts-label" htmlFor={`col1_${index}`}>
                  Received
                </label>
                <input id={`col1_${index}`} type="checkbox" name="ch1" disabled />
              </div>
            </td>
            {updateAttendanceEnabled &&
              payable && (
                <PayOptions
                  offenderNo={offenderNo}
                  eventId={eventId}
                  otherHandler={this.openModal}
                  firstName={firstName}
                  lastName={lastName}
                />
              )}
          </tr>
        )
      })

    return (
      <div className="results-activity">
        <ModalContainer isOpen={payModalOpen} onRequestClose={this.closeModal}>
          <PayOtherForm offender={activeOffender} cancelHandler={this.closeModal} onSubmit={this.onPaySubmit} />
        </ModalContainer>
        <span className="whereabouts-date print-only">
          {getLongDateFormat(date)} - {period}
        </span>
        <hr className="print-only" />
        <form className="no-print">
          <div>
            <div className="pure-u-md-1-6 padding-right">
              <WhereaboutsDatePicker handleDateChange={handleDateChange} date={date} />
            </div>
            {periodSelect}
            <button
              id="updateButton"
              className="button greyButton margin-left margin-top"
              type="button"
              onClick={getActivityList}
            >
              Update
            </button>
          </div>
          <hr />
          <ResultsFilter noBorder>
            <SortLov
              sortColumns={[LAST_NAME, CELL_LOCATION, ACTIVITY]}
              sortColumn={orderField}
              sortOrder={sortOrder}
              setColumnSort={setColumnSort}
            />
          </ResultsFilter>
        </form>
        <div className={getListSizeClass(offenders)}>
          <table className="row-gutters">
            <thead>{headings()}</thead>
            <tbody>{offenders}</tbody>
          </table>
          {!offenders ||
            (offenders.length === 0 && (
              <div className="font-small padding-top-large padding-bottom padding-left">No prisoners found</div>
            ))}
        </div>
      </div>
    )
  }
}

ResultsActivity.propTypes = {
  getActivityList: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  activityData: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      eventId: PropTypes.number,
      cellLocation: PropTypes.string.isRequired,
      eventsElsewhere: PropTypes.array,
      event: PropTypes.string.isRequired,
      eventType: PropTypes.string,
      eventDescription: PropTypes.string.isRequired,
      eventStatus: PropTypes.string,
      comment: PropTypes.string.isRequired,
    })
  ).isRequired,
  setColumnSort: PropTypes.func.isRequired,
  orderField: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  updateAttendanceEnabled: PropTypes.bool.isRequired,
  payable: PropTypes.bool.isRequired,
}

const ResultsActivityWithRouter = withRouter(ResultsActivity)

export { ResultsActivity }
export default ResultsActivityWithRouter
