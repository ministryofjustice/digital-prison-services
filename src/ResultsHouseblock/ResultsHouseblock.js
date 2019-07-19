import React, { Component, Fragment } from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import moment from 'moment'
import styled from 'styled-components'
import axios from 'axios'
import { getHoursMinutes, isTodayOrAfter, getMainEventDescription, getListSizeClass, getLongDateFormat } from '../utils'
import OtherActivitiesView from '../OtherActivityListView'
import SortableColumn from '../tablesorting/SortableColumn'
import Flags from '../Flags/Flags'
import SortLov from '../tablesorting/SortLov'
import { LAST_NAME, CELL_LOCATION, ACTIVITY } from '../tablesorting/sortColumns'
import OffenderName from '../OffenderName'
import OffenderLink from '../OffenderLink'
import Location from '../Location'
import WhereaboutsDatePicker from '../DatePickers/WhereaboutsDatePicker'
import TotalResults from '../Components/ResultsTable/elements/TotalResults'
import ModalContainer from '../Components/ModalContainer'
import PayOptions from '../ResultsActivity/elements/PayOptions'
import { Flag } from '../flags'
import { attendanceUpdated } from '../ResultsActivity/resultsActivityGAEvents'

const ManageResults = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  @media print {
    justify-content: flex-end;
  }
`

class ResultsHouseblock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalContent: null,
      modalOpen: false,
    }
  }

  olderThan7Days = () => {
    const { date } = this.props
    const searchDate = moment(date, 'DD/MM/YYYY')
    const days = moment().diff(searchDate, 'day')

    return days > 7
  }

  openModal = modalContent => {
    this.setState({
      modalContent,
      modalOpen: true,
    })
  }

  closeModal = () => {
    this.setState({ modalOpen: false })
  }

  render() {
    const {
      date,
      currentSubLocation,
      handleSubLocationChange,
      subLocations,
      handleDateChange,
      period,
      handlePeriodChange,
      handlePrint,
      houseblockData,
      update,
      sortOrder,
      orderField,
      setColumnSort,
      agencyId,
      setHouseblockOffenderAttendance,
      handleError,
    } = this.props

    const renderLocationOptions = locationOptions => {
      if (!locationOptions) {
        return (
          <option key="housinglocation_option_All" value="--">
            All
          </option>
        )
      }

      return [
        <option key="housinglocation_option_All" value="--">
          All
        </option>,
        ...locationOptions.map(loc => (
          <option key={`housinglocation_option_${loc.key}`} value={loc.key}>
            {loc.name}
          </option>
        )),
      ]
    }

    const locationSelect = (
      <div className="pure-u-md-1-3">
        <label className="form-label" htmlFor="housing-location-select">
          Select sub-location
        </label>

        <select
          id="housing-location-select"
          name="housing-location-select"
          className="form-control"
          value={currentSubLocation}
          onChange={handleSubLocationChange}
        >
          {renderLocationOptions(subLocations)}
        </select>
      </div>
    )

    const dateSelect = (
      <div className="pure-u-md-1-6 padding-left padding-right">
        <WhereaboutsDatePicker handleDateChange={handleDateChange} date={date} />
      </div>
    )

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
            heading="Activities"
            column={ACTIVITY}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            sortColumn={orderField}
          />
        </th>
        <th className="straight">Other activities</th>
        <th className="straightPrint no-display">
          <div>
            <span>Unlocked</span>
          </div>
        </th>
        <th className="straightPrint no-display">
          <div>
            <span>Gone</span>
          </div>
        </th>
        <Flag
          name={['updateAttendanceEnabled']}
          render={() => <th className="no-print">Attended</th>}
          fallbackRender={() => <></>}
        />
      </tr>
    )

    const readOnly = this.olderThan7Days()

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
        setHouseblockOffenderAttendance(offenderIndex, offenderAttendanceData)
        this.closeModal()
      } catch (error) {
        handleError(error)
      }

      raiseAnalyticsEvent(attendanceUpdated(offenderAttendanceData, agencyId))
    }

    const offenders =
      houseblockData &&
      houseblockData.map((offender, index) => {
        const { offenderNo, bookingId, firstName, lastName, cellLocation } = offender
        const mainActivity = offender.activities.find(activity => activity.mainActivity)
        const { eventId, attendanceInfo, eventLocationId } = mainActivity || {}
        const offenderDetails = {
          offenderNo,
          bookingId,
          firstName,
          lastName,
          eventId,
          eventLocationId,
          offenderIndex: index,
          attendanceInfo,
        }
        const isReceived = attendanceInfo && attendanceInfo.pay

        return (
          <tr key={offenderNo} className="row-gutters">
            <td className="row-gutters">
              <OffenderLink offenderNo={offenderNo}>
                <OffenderName firstName={firstName} lastName={lastName} />
              </OffenderLink>
            </td>
            <td className="row-gutters">
              <Location location={cellLocation} />
            </td>
            <td className="row-gutters">{offenderNo}</td>
            <td>{Flags.AlertFlags(offender.alertFlags, offender.category, 'flags')}</td>
            <td className="row-gutters">
              {mainActivity && `${getHoursMinutes(mainActivity.startTime)} - ${getMainEventDescription(mainActivity)}`}
            </td>
            <td className="row-gutters">
              <OtherActivitiesView offenderMainEvent={offender} />
            </td>
            <td className="no-padding checkbox-column no-display">
              <div className="multiple-choice whereaboutsCheckbox">
                <label className="whereabouts-label" htmlFor={`col1_${index}`}>
                  Unlocked
                </label>
                <input id={`col1_${index}`} type="checkbox" name="ch1" disabled={readOnly} />
              </div>
            </td>
            <td className="no-padding checkbox-column no-display">
              <div className="multiple-choice whereaboutsCheckbox">
                <label className="whereabouts-label" htmlFor={`col2_${index}`}>
                  Gone
                </label>
                <input id={`col2_${index}`} type="checkbox" name="ch2" disabled={readOnly} />
              </div>
            </td>
            <Flag
              name={['updateAttendanceEnabled']}
              render={() => (
                <Fragment>
                  {isReceived && <td className="no-print">Received</td>}
                  {!isReceived && (
                    <PayOptions
                      offenderDetails={offenderDetails}
                      updateOffenderAttendance={updateOffenderAttendance}
                      openModal={this.openModal}
                      closeModal={this.closeModal}
                      date={date}
                      noPay
                    />
                  )}
                </Fragment>
              )}
              fallbackRender={() => <></>}
            />
          </tr>
        )
      })

    const { modalOpen, modalContent } = this.state

    return (
      <div className="results-houseblock">
        <ModalContainer isOpen={modalOpen} onRequestClose={this.closeModal}>
          {modalContent}
        </ModalContainer>
        <span className="whereabouts-date print-only">
          {getLongDateFormat(date)} - {period}
        </span>
        <hr className="print-only" />
        <form className="no-print">
          <div>
            {locationSelect}
            {dateSelect}
            {periodSelect}
          </div>
          <hr />
          {buttons}
        </form>
        <ManageResults>
          <SortLov
            sortColumns={[LAST_NAME, CELL_LOCATION, ACTIVITY]}
            sortColumn={orderField}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
          />
          <TotalResults totalResults={houseblockData.length} />
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
ResultsHouseblock.propTypes = {
  agencyId: PropTypes.string.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handlePrint: PropTypes.func.isRequired,
  handleSubLocationChange: PropTypes.func.isRequired,
  currentSubLocation: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  houseblockData: PropTypes.arrayOf(
    PropTypes.shape({
      activities: PropTypes.arrayOf(
        PropTypes.shape({
          offenderNo: PropTypes.string.isRequired,
          firstName: PropTypes.string.isRequired,
          lastName: PropTypes.string.isRequired,
          eventId: PropTypes.number,
          cellLocation: PropTypes.string.isRequired,
          others: PropTypes.array,
          event: PropTypes.string.isRequired,
          eventType: PropTypes.string,
          eventDescription: PropTypes.string.isRequired,
          eventStatus: PropTypes.string,
          comment: PropTypes.string,
        })
      ),
    }).isRequired
  ).isRequired,
  subLocations: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  orderField: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
  setHouseblockOffenderAttendance: PropTypes.func.isRequired,
}

const ResultsHouseblockWithRouter = withRouter(ResultsHouseblock)

export { ResultsHouseblock }
export default ResultsHouseblockWithRouter
