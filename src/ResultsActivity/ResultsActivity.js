import React, { Component } from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import axios from 'axios'
import styled from 'styled-components'
import classNames from 'classnames'
import Link from '@govuk-react/link'
import { Link as RouterLink } from 'react-router-dom'
import { FONT_SIZE } from '@govuk-react/constants'
import { LINK_HOVER_COLOUR, LINK_COLOUR } from 'govuk-colours'
import {
  isWithinNextTwoWorkingDays,
  isAfterToday,
  isWithinLastWeek,
  getMainEventDescription,
  getHoursMinutes,
  getListSizeClass,
  getLongDateFormat,
  stripAgencyPrefix,
} from '../utils'

import OtherActivitiesView from '../OtherActivityListView'
import AlertFlags from '../AlertFlags'
import SortableColumn from '../tablesorting/SortableColumn'
import SortLov from '../tablesorting/SortLov'
import { ACTIVITY, CELL_LOCATION, LAST_NAME } from '../tablesorting/sortColumns'
import OffenderName from '../OffenderName'
import OffenderLink from '../OffenderLink'
import Location from '../Location'
import WhereaboutsDatePicker from '../DatePickers/WhereaboutsDatePicker'
import AttendanceOptions from '../Attendance/AttendanceOptions'
import TotalResults from '../Components/ResultsTable/elements/TotalResults'
import AttendanceNotRequiredForm from '../Attendance/AttendanceNotRequiredForm'
import { allNotRequired, attendAll } from '../Attendance/attendanceGAEvents'
import { linkOnClick } from '../helpers'
import PrintLink from '../Components/PrintLink/PrintLink'

const ManageResults = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  @media print {
    justify-content: flex-end;
  }
`
const StackedTotals = styled.div`
  display: flex;
  flex-direction: column;
  text-align: right;
`
const BatchLink = styled(Link)`
  display: block;
  font-size: ${FONT_SIZE.SIZE_22};
  color: ${LINK_COLOUR};
  cursor: pointer;
  text-decoration: underline;
  text-align: right;

  &:hover {
    color: ${LINK_HOVER_COLOUR};
  }
`

const HideForPrint = styled.span`
  @media print {
    display: none;
  }
`

const TitleLinkContainer = styled('div')`
  margin: -15px 0 15px;
`

class ResultsActivity extends Component {
  static eventCancelled(event) {
    return event.event === 'VISIT' && event.eventStatus === 'CANC'
  }

  constructor(props) {
    super(props)
    this.state = {
      attendingAll: false,
    }
    this.unattendedOffenders = new Set()
    this.totalOffenders = new Set()
  }

  componentWillUnmount() {
    const { resetErrorDispatch } = this.props
    resetErrorDispatch()
  }

  updateMultipleAttendances = ({ paid, attended, reason, comments, offenders }) =>
    axios.post('/api/attendance/batch', {
      attended,
      paid,
      reason,
      comments,
      offenders,
    })

  notRequireAll = async (values) => {
    const { showModal, reloadPage, handleError, raiseAnalyticsEvent, agencyId } = this.props
    const { comments } = values

    try {
      this.setState({ notRequiringAll: true })
      await this.updateMultipleAttendances({
        paid: true,
        attended: false,
        offenders: [...this.unattendedOffenders],
        reason: 'NotRequired',
        comments,
      })
      raiseAnalyticsEvent(allNotRequired(this.unattendedOffenders.size, agencyId))
      reloadPage()
      this.setState({ notRequiringAll: false })
    } catch (error) {
      handleError(error)
    }

    showModal(false)
  }

  render() {
    const {
      date,
      period,
      onListCriteriaChange,
      handlePrint,
      redactedPrintState,
      activityData,
      sortOrder,
      orderField,
      setColumnSort,
      agencyId,
      handleError,
      setActivityOffenderAttendance,
      resetErrorDispatch,
      setErrorDispatch,
      raiseAnalyticsEvent,
      showModal,
      activityName,
      totalAttended,
      totalAbsent,
      userRoles,
      reloadPage,
    } = this.props

    const activityHubUser = userRoles.includes('ACTIVITY_HUB')

    const periodSelect = (
      <div>
        <label className="form-label" htmlFor="period-select">
          Choose period
        </label>

        <select
          id="period-select"
          name="period-select"
          className="form-control"
          value={period}
          onChange={(e) => onListCriteriaChange({ periodValue: e })}
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
      <div id="buttons" className="pull-right">
        {isWithinNextTwoWorkingDays(date) && (
          <PrintLink onClick={() => handlePrint()} id="printButton">
            Print this page
          </PrintLink>
        )}
        {isWithinNextTwoWorkingDays(date) && isAfterToday(date) && (
          <PrintLink onClick={() => handlePrint('redacted')} className="redactedPrintButton">
            Print list for general view
          </PrintLink>
        )}
      </div>
    )

    const attendAllNonAssigned = async () => {
      try {
        this.setState({ attendingAll: true })
        await this.updateMultipleAttendances({ paid: true, attended: true, offenders: [...this.unattendedOffenders] })
        raiseAnalyticsEvent(attendAll(this.unattendedOffenders.size, agencyId))
        reloadPage()
        this.setState({ attendingAll: false })
      } catch (error) {
        handleError(error)
      }
    }

    const showUpdateAllControls = (activities, paidList) => {
      // Activities need an eventId in order to be updatable
      // Ignore ones without when deciding whether to show the
      // batch buttons - they can't be actioned.
      const activitiesWithEventId = activities.filter((activity) => activity.eventId)
      const attendanceInfo = activitiesWithEventId.filter((activity) => activity.attendanceInfo)
      const lockedCases = attendanceInfo.filter((activity) => activity.attendanceInfo.locked === true)

      return !(
        !isWithinLastWeek(date) ||
        isAfterToday(date) ||
        activitiesWithEventId.length === paidList ||
        attendanceInfo.length === activitiesWithEventId.length ||
        lockedCases.length === activitiesWithEventId.length
      )
    }

    const { attendingAll, notRequiringAll } = this.state

    const BatchControls = () => {
      const totalMarked = totalAttended + totalAbsent
      const anyRemaining = totalMarked % this.totalOffenders.size > 0 ? ' remaining ' : ' '

      return (
        <div id="batchControls" className="pure-u-md-12-12 padding-bottom">
          {showUpdateAllControls(activityData, totalMarked) && (
            <>
              {attendingAll ? (
                'Marking all as attended...'
              ) : (
                <BatchLink onClick={() => attendAllNonAssigned()} id="attendAllLink" className="no-print">
                  All
                  {anyRemaining}
                  prisoners have attended
                </BatchLink>
              )}
              {notRequiringAll ? (
                'Marking all as not required...'
              ) : (
                <BatchLink
                  onClick={() =>
                    showModal(
                      true,
                      <AttendanceNotRequiredForm showModal={showModal} submitHandler={this.notRequireAll} />
                    )
                  }
                  id="notRequireAllLink"
                  className="no-print"
                >
                  All
                  {anyRemaining}
                  prisoners are not required
                </BatchLink>
              )}
            </>
          )}
        </div>
      )
    }

    const redactedHide = redactedPrintState ? 'no-print' : 'straightPrint'
    const redactedPrint = redactedPrintState ? 'straightPrint' : 'no-print'

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
        <th className="straight width10">Prison number</th>
        <th className={`straight width10 ${redactedHide}`}>Relevant alerts</th>
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
        <th className={redactedPrintState ? 'no-print no-display' : 'checkbox-header straightPrint no-display'}>
          <div>
            <span>Received</span>
          </div>
        </th>
        <th className="straight width4 no-print">Attended</th>
        <th className="straight width6 no-print">Not attended</th>
      </tr>
    )

    const renderMainEvent = (event) => {
      const mainEventDescription = `${getHoursMinutes(event.startTime)} - ${getMainEventDescription(event)}`
      if (event.suspended) {
        return (
          <td className="row-gutters">
            <div data-qa="suspended">
              {mainEventDescription}
              <span className="suspended"> (suspended)</span>
            </div>
          </td>
        )
      }
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

    const unattendedOffenders = new Set()
    const totalOffenders = new Set()

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
        const key = `${offenderNo}-${eventId || index}`

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

        if (!attendanceInfo && eventId) {
          unattendedOffenders.add({
            offenderNo,
            bookingId,
            eventId,
            eventLocationId: locationId,
            offenderIndex: index,
            period,
            prisonId: agencyId,
            eventDate: date,
          })
        }
        totalOffenders.add(offenderNo)

        const { absentReason } = attendanceInfo || {}
        const inCaseLoad = stripAgencyPrefix(cellLocation, agencyId)
        const otherActivitiesClasses = classNames({
          'row-gutters': true,
          'last-text-column-padding': false,
        })

        return (
          <tr key={key} className="row-gutters">
            <td className={`row-gutters ${redactedHide}`}>
              {inCaseLoad && (
                <OffenderLink offenderNo={offenderNo}>
                  <OffenderName firstName={firstName} lastName={lastName} />
                </OffenderLink>
              )}
              {!inCaseLoad && <OffenderName firstName={firstName} lastName={lastName} />}
            </td>
            <td className={`no-display ${redactedPrint}`}>
              <OffenderLink offenderNo={offenderNo}>
                <OffenderName firstName={firstName.charAt(0)} lastName={lastName} />
              </OffenderLink>
            </td>
            <td className="row-gutters">
              <Location location={cellLocation} />
            </td>
            <td className={`row-gutters ${redactedHide}`}>{offenderNo}</td>
            <td className={`no-display ${redactedPrint}`}>{offenderNo.replace(/^.{3}/g, '***')}</td>
            <td className={redactedHide}>
              <AlertFlags alerts={alertFlags} category={category} />
            </td>
            {renderMainEvent(mainEvent)}
            <td className={otherActivitiesClasses}>
              <OtherActivitiesView
                offenderMainEvent={{
                  ...mainEvent,
                  others: mainEvent.eventsElsewhere,
                }}
              />
            </td>
            {!absentReason && (
              <td className={`checkbox-header no-display ${redactedHide}`}>
                <div className="multiple-choice whereaboutsCheckbox">
                  <label className="whereabouts-label" htmlFor={`col1_${index}`}>
                    Received
                  </label>
                  <input id={`col1_${index}`} type="checkbox" name="ch1" disabled />
                </div>
              </td>
            )}
            <AttendanceOptions
              offenderDetails={offenderDetails}
              raiseAnalyticsEvent={raiseAnalyticsEvent}
              resetErrorDispatch={resetErrorDispatch}
              setErrorDispatch={setErrorDispatch}
              reloadPage={reloadPage}
              handleError={handleError}
              agencyId={agencyId}
              period={period}
              showModal={showModal}
              activityName={activityName}
              setOffenderAttendance={setActivityOffenderAttendance}
              date={date}
              payAll={false}
            />
          </tr>
        )
      })

    this.unattendedOffenders = unattendedOffenders
    this.totalOffenders = totalOffenders

    return (
      <div className="results-activity">
        <span className="whereabouts-date print-only">
          {getLongDateFormat(date)} - {period}
        </span>

        <TitleLinkContainer className="horizontal-information govuk-!-display-none-print">
          <div className="horizontal-information__item">
            <a href="/manage-prisoner-whereabouts/select-location" className="govuk-link">
              Select another activity or appointment location
            </a>
          </div>
          <div className="horizontal-information__item">{buttons}</div>
        </TitleLinkContainer>

        <hr className="print-only" />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-three-quarters">
            <form className="form-background govuk-!-padding-3 govuk-!-margin-bottom-5 govuk-!-display-none-print">
              <h2 className="govuk-heading-m">View by</h2>
              <div className="horizontal-form">
                <WhereaboutsDatePicker
                  handleDateChange={(e) => onListCriteriaChange({ dateValue: e })}
                  date={date}
                  marginBottom={0}
                />

                {periodSelect}
              </div>
            </form>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <StackedTotals>
              <TotalResults label="Prisoners listed:" totalResults={this.totalOffenders.size} />
              <HideForPrint>
                <TotalResults label="Sessions attended:" totalResults={totalAttended} />
              </HideForPrint>
            </StackedTotals>

            <Link as={RouterLink} {...linkOnClick(reloadPage)} className="pull-right govuk-!-display-none-print">
              Check for updates to the list
            </Link>
          </div>
        </div>

        <ManageResults>
          <div className="pure-u-md-1-4 margin-top-small">
            <SortLov
              sortColumns={[LAST_NAME, CELL_LOCATION, ACTIVITY]}
              sortColumn={orderField}
              sortOrder={sortOrder}
              setColumnSort={setColumnSort}
            />
          </div>
          <StackedTotals>{activityHubUser && <BatchControls />}</StackedTotals>
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
  handlePrint: PropTypes.func.isRequired,
  redactedPrintState: PropTypes.bool.isRequired,
  getActivityList: PropTypes.func.isRequired,
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
      suspended: PropTypes.bool,
    })
  ).isRequired,
  totalAttended: PropTypes.number.isRequired,
  totalAbsent: PropTypes.number.isRequired,
  setColumnSort: PropTypes.func.isRequired,
  orderField: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  handleError: PropTypes.func.isRequired,
  setActivityOffenderAttendance: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setErrorDispatch: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  reloadPage: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  activityName: PropTypes.string.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onListCriteriaChange: PropTypes.func.isRequired,
}

const ResultsActivityWithRouter = withRouter(ResultsActivity)

export { ResultsActivity }
export default ResultsActivityWithRouter
