import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import Error from '../Error'
import ResultsActivity from './ResultsActivity'
import { setSearchActivities, showPaymentReasonModal } from '../redux/actions'
import Spinner from '../Spinner'
import { getActivityListReasons } from '../ModalProvider/PaymentReasonModal/reasonCodes'

class ResultsActivityContainer extends Component {
  async componentWillMount() {
    const { activity, getActivityList, history } = this.props

    try {
      this.handlePrint = this.handlePrint.bind(this)
      if (activity) {
        getActivityList()
      } else {
        history.push('/whereaboutssearch')
      }
    } catch (error) {
      this.handleError(error)
    }
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
    const { loaded } = this.props

    if (!loaded) {
      return <Spinner />
    }
    return (
      <div>
        <Error {...this.props} />
        <ResultsActivity handlePrint={this.handlePrint} {...this.props} />
      </div>
    )
  }
}

ResultsActivityContainer.propTypes = {
  // props
  handleError: PropTypes.func.isRequired,
  getActivityList: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
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
  // mapDispatchToProps
  activitiesDispatch: PropTypes.func.isRequired,
  showPaymentReasonModal: PropTypes.func.isRequired,
  // other?
  error: PropTypes.string,
  // special
  history: ReactRouterPropTypes.history.isRequired,
}

ResultsActivityContainer.defaultProps = {
  activities: null,
  activityData: null,
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
})

const mapDispatchToProps = dispatch => ({
  activitiesDispatch: text => dispatch(setSearchActivities(text)),
  showPaymentReasonModal: (event, browserEvent) =>
    dispatch(showPaymentReasonModal({ event, browserEvent, reasons: getActivityListReasons() })),
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ResultsActivityContainer)
)
