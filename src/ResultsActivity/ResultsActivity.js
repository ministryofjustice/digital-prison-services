import React, { Component } from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import axios from 'axios'
import styled from 'styled-components'
import { isTodayOrAfter, getMainEventDescription, getHoursMinutes, getListSizeClass, getLongDateFormat } from '../utils'
import OtherActivitiesView from '../OtherActivityListView'
import Flags from '../Flags/Flags'
import SortableColumn from '../tablesorting/SortableColumn'
import SortLov from '../tablesorting/SortLov'
import { ACTIVITY, CELL_LOCATION, LAST_NAME } from '../tablesorting/sortColumns'
import OffenderName from '../OffenderName'
import OffenderLink from '../OffenderLink'
import Location from '../Location'
import WhereaboutsDatePicker from '../DatePickers/WhereaboutsDatePicker'
import PayOptions from './elements/PayOptions'
import TotalResults from '../Components/ResultsTable/elements/TotalResults'
import { Flag } from '../flags'
import { attendanceUpdated } from './resultsActivityGAEvents'

const ManageResults = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  @media print {
    justify-content: flex-end;
  }
`

class ResultsActivity extends Component {
  static eventCancelled(event) {
    return event.event === 'VISIT' && event.eventStatus === 'CANC'
  }

  componentWillUnmount() {
    const { resetErrorDispatch } = this.props
    resetErrorDispatch()
  }

  render() {
    const {
      handleDateChange,
      date,
      period,
      handlePeriodChange,
      handlePrint,
      activityData,
      getActivityList,
      sortOrder,
      orderField,
      setColumnSort,
      agencyId,
      handleError,
      setActivityOffenderAttendance,
      showModal,
      activityName,
    } = this.props

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

    const buttons = (
      <div id="buttons" className="pure-u-md-12-12 padding-bottom">
        {isTodayOrAfter(date) && (
          <button
            id="printButton"
            className="button"
            type="button"
            onClick={() => {
              handlePrint()
            }}
          >
            <img className="print-icon" src="/images/Printer_icon_white.png" height="23" width="20" alt="Print icon" />{' '}
            Print list
          </button>
        )}
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
        <Flag
          name={['updateAttendanceEnabled']}
          render={() => (
            <React.Fragment>
              <th className="straight width4 no-print">Attended</th>
              <th className="straight width6 no-print">Not attended</th>
            </React.Fragment>
          )}
          fallbackRender={() => <></>}
        />
      </tr>
    )

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

    const unpaidOffenders = new Set()

    const attendAllNonAssigned = async () => {
      const offenders = [...unpaidOffenders]
      const response = await axios.post('/api/attendance/batch', {
        offenders,
      })

      const findOffenderIndexByBookingId = bookingId => {
        const offender = offenders.find(off => off.bookingId === bookingId)
        return offender.offenderIndex
      }

      response.data.map(offender => {
        const { paid, attended } = offender
        const offenderAttendanceData = { paid, attended, pay: attended && paid }
        try {
          setActivityOffenderAttendance(findOffenderIndexByBookingId(offender.bookingId), offenderAttendanceData)
        } catch (error) {
          handleError(error)
        }
        return offender
      })
    }

    const updateOffenderAttendance = async (attendanceDetails, offenderIndex) => {
      const { resetErrorDispatch, raiseAnalyticsEvent } = this.props
      const eventDetails = { prisonId: agencyId, period, eventDate: date }
      const { id, attended, paid, absentReason, comments } = attendanceDetails || {}

      const offenderAttendanceData = {
        comments,
        paid,
        absentReason,
        pay: attended && paid,
        other: Boolean(absentReason),
      }

      resetErrorDispatch()

      try {
        const response = await axios.post('/api/attendance', {
          ...eventDetails,
          ...attendanceDetails,
          absentReason: attendanceDetails.absentReason && attendanceDetails.absentReason.value,
        })
        offenderAttendanceData.id = response.data.id || id
        setActivityOffenderAttendance(offenderIndex, offenderAttendanceData)
        showModal(false)
      } catch (error) {
        handleError(error)
      }

      raiseAnalyticsEvent(attendanceUpdated(offenderAttendanceData, agencyId))
    }

    const offenders =
      activityData &&
      activityData.map((mainEvent, index) => {
        const {
          offenderNo,
          firstName,
          lastName,
          cellLocation,
          alertFlags,
          category,
          eventId,
          attendanceInfo,
          locationId,
          bookingId,
        } = mainEvent
        const key = `${offenderNo}-${eventId}`

        const offenderDetails = {
          offenderNo,
          bookingId,
          firstName,
          lastName,
          eventId,
          eventLocationId: locationId,
          offenderIndex: index,
          cellLocation,
          attendanceInfo,
        }

        if (!attendanceInfo)
          unpaidOffenders.add({
            offenderNo,
            bookingId,
            eventId,
            eventLocationId: locationId,
            offenderIndex: index,
            attended: true,
            paid: true,
            period,
            prisonId: agencyId,
            eventDate: date,
          })

        const { absentReason } = attendanceInfo || {}

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
            {!absentReason && (
              <td className="no-padding checkbox-column no-display">
                <div className="multiple-choice whereaboutsCheckbox">
                  <label className="whereabouts-label" htmlFor={`col1_${index}`}>
                    Received
                  </label>
                  <input id={`col1_${index}`} type="checkbox" name="ch1" disabled />
                </div>
              </td>
            )}
            <Flag
              name={['updateAttendanceEnabled']}
              render={() => (
                <PayOptions
                  offenderDetails={offenderDetails}
                  updateOffenderAttendance={updateOffenderAttendance}
                  showModal={showModal}
                  activityName={activityName}
                  date={date}
                  payAll={false}
                />
              )}
              fallbackRender={() => <></>}
            />
          </tr>
        )
      })

    return (
      <div className="results-activity">
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
          {buttons}
        </form>

        <button
          id="allAttendedButton"
          className="button greyButton margin-bottom"
          type="button"
          onClick={attendAllNonAssigned}
        >
          Select all as attended
        </button>
        <ManageResults>
          <SortLov
            sortColumns={[LAST_NAME, CELL_LOCATION, ACTIVITY]}
            sortColumn={orderField}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
          />

          <TotalResults totalResults={activityData.length} />
        </ManageResults>
        <div className={getListSizeClass(offenders)}>
          <table className="row-gutters">
            <thead>{headings()}</thead>
            <tbody>{offenders}</tbody>
          </table>
          {!offenders || offenders.length === 0 ? (
            <div className="font-small padding-top-large padding-bottom padding-left">No prisoners found</div>
          ) : (
            <div className="padding-top">{buttons}</div>
          )}
        </div>
      </div>
    )
  }
}

ResultsActivity.propTypes = {
  agencyId: PropTypes.string.isRequired,
  getActivityList: PropTypes.func.isRequired,
  handlePrint: PropTypes.func.isRequired,
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
  handleError: PropTypes.func.isRequired,
  setActivityOffenderAttendance: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  activityName: PropTypes.string.isRequired,
}

const ResultsActivityWithRouter = withRouter(ResultsActivity)

export { ResultsActivity }
export default ResultsActivityWithRouter
