import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import moment from 'moment'
import ResultsActivity from './ResultsActivity'
import {
  resetError,
  setActivityData,
  setLoaded,
  setOrderField,
  setSearchActivities,
  setSortOrder,
  setOffenderAttendanceData,
  getAbsentReasons,
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
    this.state = {
      payable: true,
    }
  }

  async componentDidMount() {
    const { activity, history } = this.props

    try {
      if (activity) {
        this.getActivityList()
      } else {
        history.push('/search-prisoner-whereabouts')
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  componentWillUnmount() {
    const { activityDataDispatch } = this.props
    activityDataDispatch([])
  }

  setColumnSort(sortColumn, sortOrder) {
    const { orderDispatch, sortOrderDispatch, activityData, activityDataDispatch } = this.props
    orderDispatch(sortColumn)
    sortOrderDispatch(sortOrder)
    const copy = activityData.slice()
    sortActivityData(copy, sortColumn, sortOrder)
    activityDataDispatch(copy)
  }

  async getActivityList() {
    const {
      agencyId,
      activity,
      period,
      resetErrorDispatch,
      setLoadedDispatch,
      activityDataDispatch,
      orderDispatch,
      sortOrderDispatch,
      date,
      handleError,
      updateAttendanceEnabled,
      getAbsentReasonsDispatch,
    } = this.props

    try {
      resetErrorDispatch()
      setLoadedDispatch(false)
      const config = {
        params: {
          agencyId,
          locationId: activity,
          date: date === 'Today' ? moment().format('DD/MM/YYYY') : date,
          timeSlot: period,
        },
      }
      const response = await axios.get('/api/activitylist', config)
      const activityData = response.data

      const orderField = 'activity'
      const sortOrder = 'ASC'

      orderDispatch(orderField)
      sortOrderDispatch(sortOrder)

      sortActivityData(activityData, orderField, sortOrder)
      activityDataDispatch(activityData)
      if (updateAttendanceEnabled) getAbsentReasonsDispatch()
    } catch (error) {
      handleError(error)
    }
    this.setState({ payable: this.isPayableDate() })
    setLoadedDispatch(true)
  }

  getActivityName() {
    const { activities, activity } = this.props
    return (
      activities
        .filter(a => a.locationId === Number(activity))
        .map(a => a.userDescription)
        .find(a => !!a) || null
    )
  }

  isPayableDate = () => {
    const { date } = this.props

    const selectedDate = moment(date, 'DD-MM-YYYY')
    const historicRange = moment()
      .subtract(6, 'd')
      .startOf('day')

    if (selectedDate.isBefore(historicRange)) return false

    return true
  }

  handlePrint() {
    const { raiseAnalyticsEvent } = this.props

    raiseAnalyticsEvent({
      category: 'Activity list',
      action: 'Print list',
    })
    window.print()
  }

  render() {
    const { resetErrorDispatch, setOffenderPaymentDataDispatch } = this.props
    const { payable } = this.state
    const activityName = this.getActivityName()

    return (
      <Page title={activityName} alwaysRender>
        <ResultsActivity
          handlePrint={this.handlePrint}
          getActivityList={this.getActivityList}
          resetErrorDispatch={resetErrorDispatch}
          setColumnSort={this.setColumnSort}
          payable={payable}
          handleError={this.handleError}
          setOffenderAttendanceData={setOffenderPaymentDataDispatch}
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

  // mapDispatchToProps
  activitiesDispatch: PropTypes.func.isRequired,
  orderDispatch: PropTypes.func.isRequired,
  sortOrderDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  activityDataDispatch: PropTypes.func.isRequired,

  // special
  history: ReactRouterPropTypes.history.isRequired,
}

ResultsActivityContainer.defaultProps = {
  activities: [],
  activityData: [],
  error: '',
}

const mapStateToProps = state => ({
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
  updateAttendanceEnabled: state.app.config.updateAttendanceEnabled,
})

const mapDispatchToProps = dispatch => ({
  orderDispatch: field => dispatch(setOrderField(field)),
  sortOrderDispatch: field => dispatch(setSortOrder(field)),
  activitiesDispatch: text => dispatch(setSearchActivities(text)),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
  resetErrorDispatch: () => dispatch(resetError()),
  activityDataDispatch: data => dispatch(setActivityData(data)),
  setOffenderPaymentDataDispatch: (offenderIndex, data) => dispatch(setOffenderAttendanceData(offenderIndex, data)),
  getAbsentReasonsDispatch: () => dispatch(getAbsentReasons()),
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ResultsActivityContainer)
)
