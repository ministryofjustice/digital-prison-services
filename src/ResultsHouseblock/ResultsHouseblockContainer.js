import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import moment from 'moment'
import { properCase } from '../utils'
import sortHouseblockData from './houseblockResultsSorter'
import ResultsHouseblock from './ResultsHouseblock'

import {
  resetError,
  setError,
  setLoaded,
  setHouseblockData,
  setOrderField,
  setSearchSubLocation,
  setSearchWingStatus,
  setSortOrder,
  getAbsentReasons,
  setHouseblockOffenderAttendance,
} from '../redux/actions'
import Page from '../Components/Page'

const axios = require('axios')

class ResultsHouseblockContainer extends Component {
  constructor(props) {
    super(props)
    this.handleSubLocationChange = this.handleSubLocationChange.bind(this)
    this.handleWingStatusChange = this.handleWingStatusChange.bind(this)

    this.getHouseblockList = this.getHouseblockList.bind(this)
    this.setColumnSort = this.setColumnSort.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
    this.update = this.update.bind(this)
    this.state = {
      activeSubLocation: null,
      redactedPrint: false,
    }
  }

  async componentDidMount() {
    const { currentLocation, history, resetErrorDispatch } = this.props
    resetErrorDispatch()

    try {
      if (currentLocation) {
        this.getHouseblockList('lastName', 'ASC')
      } else {
        history.push('/manage-prisoner-whereabouts')
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async componentDidUpdate(prevProps) {
    const { date, period, currentLocation, currentSubLocation, wingStatus } = this.props

    if (
      (prevProps.date && prevProps.date !== date) ||
      (prevProps.period && prevProps.period !== period) ||
      (prevProps.currentLocation && prevProps.currentLocation !== currentLocation) ||
      (prevProps.currentSubLocation && prevProps.currentSubLocation !== currentSubLocation) ||
      (prevProps.wingStatus && prevProps.wingStatus !== wingStatus)
    ) {
      await this.update()
    }
  }

  componentWillUnmount() {
    const { houseblockDataDispatch, wingStatusDispatch } = this.props
    houseblockDataDispatch([])
    wingStatusDispatch('all')
  }

  setColumnSort(sortColumn, sortOrder) {
    const { orderDispatch, sortOrderDispatch, houseblockData, houseblockDataDispatch } = this.props
    orderDispatch(sortColumn)
    sortOrderDispatch(sortOrder)
    const copy = houseblockData.slice()
    sortHouseblockData(copy, sortColumn, sortOrder)
    houseblockDataDispatch(copy)
  }

  async getHouseblockList(orderField, sortOrder) {
    let { date } = this.props
    const {
      agencyId,
      wingStatus,
      currentLocation,
      currentSubLocation,
      period,
      resetErrorDispatch,
      setLoadedDispatch,
      orderDispatch,
      sortOrderDispatch,
      houseblockDataDispatch,
      handleError,
      getAbsentReasonsDispatch,
    } = this.props

    try {
      this.setState(state => ({
        ...state,
        activeSubLocation: currentSubLocation,
      }))
      resetErrorDispatch()
      setLoadedDispatch(false)

      orderDispatch(orderField)
      sortOrderDispatch(sortOrder)

      if (date === 'Today') {
        // replace placeholder text
        date = moment().format('DD/MM/YYYY')
      }

      const compoundGroupName = (location, subLocation) =>
        subLocation && subLocation !== '--' ? `${location}_${subLocation}` : location

      const config = {
        params: {
          agencyId,
          groupName: compoundGroupName(currentLocation, currentSubLocation),
          date,
          timeSlot: period,
          wingStatus,
        },
        headers: {
          'Sort-Fields': 'lastName',
          'Sort-Order': 'ASC',
        },
      }

      const response = await axios.get('/api/houseblocklist', config)
      const houseblockData = response.data
      sortHouseblockData(houseblockData, orderField, sortOrder)
      houseblockDataDispatch(houseblockData)
      getAbsentReasonsDispatch()
    } catch (error) {
      handleError(error)
    }
    setLoadedDispatch(true)
  }

  update() {
    const { currentSubLocation, orderField, sortOrder } = this.props
    const { activeSubLocation } = this.state

    if (currentSubLocation === '--') {
      if (activeSubLocation !== '--') {
        this.getHouseblockList('lastName', 'ASC')
      } else {
        this.getHouseblockList(orderField, sortOrder)
      }
    } else if (activeSubLocation === '--') {
      this.getHouseblockList('cellLocation', 'ASC')
    } else {
      this.getHouseblockList(orderField, sortOrder)
    }
  }

  handlePrint(version) {
    const { raiseAnalyticsEvent } = this.props

    if (version === 'redacted') {
      this.setState({ redactedPrint: true }, () => {
        window.print()
      })

      raiseAnalyticsEvent({
        category: 'Redacted Residential list',
        action: 'Print list',
      })
    }

    if (!version) {
      this.setState({ redactedPrint: false }, () => {
        window.print()
      })

      raiseAnalyticsEvent({
        category: 'House block list',
        action: 'Print list',
      })
    }
  }

  handleSubLocationChange(event) {
    const { subLocationDispatch } = this.props

    subLocationDispatch(event.target.value)
  }

  handleWingStatusChange(event) {
    const { wingStatusDispatch } = this.props

    wingStatusDispatch(event.target.value)
  }

  titleString() {
    const { activeSubLocation } = this.state
    const { locations, subLocations, currentLocation, wingStatus } = this.props
    const locationName = locations.filter(location => location.key === currentLocation).map(it => it.name)[0]
    let title = locationName
    if (activeSubLocation && activeSubLocation !== '--') {
      const subLocationName = subLocations.filter(location => location.key === activeSubLocation).map(it => it.name)[0]
      title = `${locationName} - ${subLocationName}`
    }
    return `${title} - ${properCase(wingStatus)}`
  }

  render() {
    const title = this.titleString()
    const { resetErrorDispatch, setErrorDispatch, setOffenderPaymentDataDispatch, showModal } = this.props
    const { redactedPrint } = this.state

    return (
      <Page title={title} alwaysRender>
        <ResultsHouseblock
          handlePrint={this.handlePrint}
          handleSubLocationChange={this.handleSubLocationChange}
          handleWingStatusChange={this.handleWingStatusChange}
          setColumnSort={this.setColumnSort}
          update={this.update}
          resetErrorDispatch={resetErrorDispatch}
          setErrorDispatch={setErrorDispatch}
          handleError={this.handleError}
          setHouseblockOffenderAttendance={setOffenderPaymentDataDispatch}
          showModal={showModal}
          activityName={title}
          redactedPrintState={redactedPrint}
          {...this.props}
        />
      </Page>
    )
  }
}

ResultsHouseblockContainer.propTypes = {
  // props
  handleError: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,

  // mapStateToProps
  agencyId: PropTypes.string.isRequired,
  currentLocation: PropTypes.string.isRequired,
  wingStatus: PropTypes.string.isRequired,
  currentSubLocation: PropTypes.string.isRequired,
  houseblockData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  locations: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  loaded: PropTypes.bool.isRequired,
  orderField: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  subLocations: PropTypes.arrayOf(PropTypes.object).isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),

  // mapDispatchToProps
  houseblockDataDispatch: PropTypes.func.isRequired,
  orderDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  sortOrderDispatch: PropTypes.func.isRequired,
  subLocationDispatch: PropTypes.func.isRequired,
  wingStatusDispatch: PropTypes.func.isRequired,
  setOffenderPaymentDataDispatch: PropTypes.func.isRequired,
  getAbsentReasonsDispatch: PropTypes.func.isRequired,

  // special
  history: ReactRouterPropTypes.history.isRequired,
}

ResultsHouseblockContainer.defaultProps = {
  error: '',
}

const extractSubLocations = (locations, currentLocation) => {
  if (!locations) return []
  if (!currentLocation) return []
  const children = locations.filter(l => l.key === currentLocation).map(l => (l.children ? l.children : []))
  return children.length > 0 ? children[0] : []
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  currentLocation: state.search.location,
  currentSubLocation: state.search.subLocation,
  date: state.search.date,
  period: state.search.period,
  wingStatus: state.search.wingStatus,
  houseblockData: state.events.houseblockData,
  loaded: state.app.loaded,
  orderField: state.events.orderField,
  paymentReasonReasons: state.events.paymentReasonReasons,
  sortOrder: state.events.sortOrder,
  locations: state.search.locations,
  subLocations: extractSubLocations(state.search.locations, state.search.location),
  error: state.app.error,
  totalAttended: state.events.totalAttended,
})

const mapDispatchToProps = dispatch => ({
  houseblockDataDispatch: data => dispatch(setHouseblockData(data)),
  orderDispatch: field => dispatch(setOrderField(field)),
  resetErrorDispatch: () => dispatch(resetError()),
  setErrorDispatch: error => dispatch(setError(error)),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
  sortOrderDispatch: field => dispatch(setSortOrder(field)),
  subLocationDispatch: text => dispatch(setSearchSubLocation(text)),
  wingStatusDispatch: status => dispatch(setSearchWingStatus(status)),
  setOffenderPaymentDataDispatch: (offenderIndex, data) =>
    dispatch(setHouseblockOffenderAttendance(offenderIndex, data)),
  getAbsentReasonsDispatch: () => dispatch(getAbsentReasons()),
})

export { ResultsHouseblockContainer, extractSubLocations }

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ResultsHouseblockContainer)
)
