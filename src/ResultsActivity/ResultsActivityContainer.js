import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import queryString from 'query-string'

import ResultsActivity from './ResultsActivity'
import {
  getAbsentReasons,
  resetError,
  setActivityData,
  setActivityOffenderAttendance,
  setError,
  setLoaded,
  setOrderField,
  setSearchActivities,
  setSearchActivity,
  setSortOrder,
} from '../redux/actions'
import sortActivityData from './activityResultsSorter'
import Page from '../Components/Page'

const axios = require('axios')

class ResultsActivityContainer extends Component {
  constructor(props) {
    super(props)
    this.handlePrint = this.handlePrint.bind(this)
    this.setColumnSort = this.setColumnSort.bind(this)
    this.getActivityList = this.getActivityList.bind(this)
    this.onListCriteriaChange = this.onListCriteriaChange.bind(this)
    this.reload = this.reload.bind(this)
    this.state = {
      redactedPrint: false,
    }
  }

  async componentDidMount() {
    const { location: routerLocation, getAbsentReasonsDispatch } = this.props
    const { search } = routerLocation

    const { date, period, location } = queryString.parse(search)

    if (!date || !period || !location) {
      window.location = '/manage-prisoner-whereabouts/select-location'
    } else {
      getAbsentReasonsDispatch()
      await this.getActivityList({ date, period, location })
    }
  }

  componentWillUnmount() {
    const { activityDataDispatch } = this.props
    activityDataDispatch([])
  }

  handlePrint(version) {
    const { raiseAnalyticsEvent } = this.props

    if (version === 'redacted') {
      this.setState({ redactedPrint: true }, () => {
        window.print()
      })

      raiseAnalyticsEvent({
        category: 'Redacted Activity list',
        action: 'Print list',
      })
    }

    if (!version) {
      this.setState({ redactedPrint: false }, () => {
        window.print()
      })

      raiseAnalyticsEvent({
        category: 'Activity list',
        action: 'Print list',
      })
    }
  }

  onListCriteriaChange({ dateValue, periodValue }) {
    const { date, period, activity, handleDateChange, handlePeriodChange } = this.props

    if (dateValue) {
      handleDateChange(date)
      return this.getActivityList({ date: dateValue.format('DD/MM/YYYY'), period, location: activity })
    }

    handlePeriodChange(periodValue)
    return this.getActivityList({ period: periodValue.target.value, date, location: activity })
  }

  setColumnSort(sortColumn, sortOrder) {
    const { orderDispatch, sortOrderDispatch, activityData, activityDataDispatch } = this.props
    orderDispatch(sortColumn)
    sortOrderDispatch(sortOrder)
    const copy = activityData.slice()
    sortActivityData(copy, sortColumn, sortOrder)
    activityDataDispatch(copy)
  }

  async getActivityList({ date, period, location }) {
    const {
      agencyId,
      resetErrorDispatch,
      setLoadedDispatch,
      activityDataDispatch,
      orderDispatch,
      sortOrderDispatch,
      handleError,
      searchActivity,
      handleDateChange,
      handlePeriodChange,
      activities,
      activitiesDispatch,
    } = this.props

    try {
      resetErrorDispatch()
      setLoadedDispatch(false)

      handleDateChange(date)
      const response = await axios.get('/api/activitylist', {
        params: {
          agencyId,
          locationId: location,
          date,
          timeSlot: period,
        },
      })
      if (response?.data?.error) {
        handleError(response.data.error)
        setLoadedDispatch(true)
        return
      }
      const activityData = response.data

      const orderField = 'activity'
      const sortOrder = 'ASC'

      handlePeriodChange({
        target: {
          value: period,
        },
      })
      searchActivity(location)

      if (!activities?.length) {
        const locationsResponse = await axios.get('/api/activityLocations', {
          params: {
            agencyId,
            bookedOnDay: date,
            timeSlot: period,
          },
        })
        activitiesDispatch(locationsResponse.data)
      }

      orderDispatch(orderField)
      sortOrderDispatch(sortOrder)
      sortActivityData(activityData, orderField, sortOrder)
      activityDataDispatch(activityData)
    } catch (error) {
      handleError(error)
    }
    setLoadedDispatch(true)
  }

  getActivityName() {
    const { activities, activity } = this.props
    if (!activities || !activity) return ''

    return (
      activities
        .filter((a) => a.locationId === Number(activity))
        .map((a) => a.userDescription)
        .find((a) => !!a) || null
    )
  }

  reload() {
    const { date, period, activity } = this.props

    return this.getActivityList({ period, date, location: activity })
  }

  render() {
    const {
      resetErrorDispatch,
      setErrorDispatch,
      setOffenderPaymentDataDispatch,
      showModal,
      userRoles,
      totalAttended,
      totalAbsent,
    } = this.props

    const { redactedPrint } = this.state
    const activityName = this.getActivityName()

    return (
      <Page title={activityName} alwaysRender>
        <ResultsActivity
          handlePrint={this.handlePrint}
          getActivityList={this.getActivityList}
          setColumnSort={this.setColumnSort}
          handleError={this.handleError}
          reloadPage={this.reload}
          setActivityOffenderAttendance={setOffenderPaymentDataDispatch}
          activityName={activityName}
          resetErrorDispatch={resetErrorDispatch}
          setErrorDispatch={setErrorDispatch}
          showModal={showModal}
          userRoles={userRoles}
          redactedPrintState={redactedPrint}
          totalAttended={totalAttended}
          totalAbsent={totalAbsent}
          onListCriteriaChange={this.onListCriteriaChange}
          {...this.props}
        />
      </Page>
    )
  }
}

ResultsActivityContainer.propTypes = {
  // props
  handleError: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  getAbsentReasonsDispatch: PropTypes.func.isRequired,
  setOffenderPaymentDataDispatch: PropTypes.func.isRequired,

  // mapStateToProps
  activity: PropTypes.string.isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({ locationId: PropTypes.number.isRequired, userDescription: PropTypes.string.isRequired })
  ),
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  agencyId: PropTypes.string.isRequired,
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
  ),
  loaded: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),
  userRoles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  totalAttended: PropTypes.number.isRequired,
  totalAbsent: PropTypes.number.isRequired,

  // mapDispatchToProps
  activitiesDispatch: PropTypes.func.isRequired,
  orderDispatch: PropTypes.func.isRequired,
  sortOrderDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setErrorDispatch: PropTypes.func.isRequired,
  activityDataDispatch: PropTypes.func.isRequired,
  locationDispatch: PropTypes.func.isRequired,
  searchActivity: PropTypes.func.isRequired,

  // special
  history: ReactRouterPropTypes.history.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
}

ResultsActivityContainer.defaultProps = {
  activities: [],
  activityData: [],
  error: '',
}

const mapStateToProps = (state) => ({
  activities: state.search.activities,
  activity: state.search.activity,
  date: state.search.date,
  period: state.search.period,
  agencyId: state.app.user.activeCaseLoadId,
  activityData: state.events.activityData,
  loaded: state.app.loaded,
  error: state.app.error,
  orderField: state.events.orderField,
  sortOrder: state.events.sortOrder,
  totalAttended: state.events.totalAttended,
  totalAbsent: state.events.totalAbsent,
  userRoles: state.app.user.roles,
})

const mapDispatchToProps = (dispatch) => ({
  orderDispatch: (field) => dispatch(setOrderField(field)),
  sortOrderDispatch: (field) => dispatch(setSortOrder(field)),
  activitiesDispatch: (text) => dispatch(setSearchActivities(text)),
  setLoadedDispatch: (status) => dispatch(setLoaded(status)),
  resetErrorDispatch: () => dispatch(resetError()),
  setErrorDispatch: (error) => dispatch(setError(error)),
  activityDataDispatch: (data) => dispatch(setActivityData(data)),
  setOffenderPaymentDataDispatch: (offenderIndex, data) => dispatch(setActivityOffenderAttendance(offenderIndex, data)),
  getAbsentReasonsDispatch: () => dispatch(getAbsentReasons()),
  searchActivity: (locationId) => dispatch(setSearchActivity(locationId)),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResultsActivityContainer))
