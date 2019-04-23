import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import moment from 'moment'
import sortHouseBlockData from './houseBlockResultsSorter'
import ResultsHouseblock from './ResultsHouseblock'
import {
  resetError,
  setLoaded,
  setHouseblockData,
  setOrderField,
  setSearchSubLocation,
  setSortOrder,
} from '../redux/actions'
import Page from '../Components/Page'

const axios = require('axios')

class ResultsHouseblockContainer extends Component {
  constructor(props) {
    super(props)
    this.handleSubLocationChange = this.handleSubLocationChange.bind(this)
    this.getHouseblockList = this.getHouseblockList.bind(this)
    this.setColumnSort = this.setColumnSort.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
    this.update = this.update.bind(this)
    this.state = {
      activeSubLocation: null,
    }
  }

  async componentDidMount() {
    const { currentLocation, history, resetErrorDispatch } = this.props
    resetErrorDispatch()

    try {
      if (currentLocation) {
        this.getHouseblockList('lastName', 'ASC')
      } else {
        history.push('/search-prisoner-whereabouts')
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  componentWillUnmount() {
    const { houseblockDataDispatch } = this.props
    houseblockDataDispatch([])
  }

  setColumnSort(sortColumn, sortOrder) {
    const { orderDispatch, sortOrderDispatch, houseblockData, houseblockDataDispatch } = this.props
    orderDispatch(sortColumn)
    sortOrderDispatch(sortOrder)
    const copy = houseblockData.slice()
    sortHouseBlockData(copy, sortColumn, sortOrder)
    houseblockDataDispatch(copy)
  }

  async getHouseblockList(orderField, sortOrder) {
    let { date } = this.props
    const {
      agencyId,
      currentLocation,
      currentSubLocation,
      period,
      resetErrorDispatch,
      setLoadedDispatch,
      orderDispatch,
      sortOrderDispatch,
      houseblockDataDispatch,
      handleError,
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
        },
        headers: {
          'Sort-Fields': 'lastName',
          'Sort-Order': 'ASC',
        },
      }

      const response = await axios.get('/api/houseblocklist', config)
      const houseBlockData = response.data
      sortHouseBlockData(houseBlockData, orderField, sortOrder)
      houseblockDataDispatch(houseBlockData)
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

  handlePrint() {
    const { raiseAnalyticsEvent } = this.props
    raiseAnalyticsEvent({
      category: 'House block list',
      action: 'Print list',
    })
    window.print()
  }

  handleSubLocationChange(event) {
    const { subLocationDispatch } = this.props

    subLocationDispatch(event.target.value)
  }

  titleString() {
    const { activeSubLocation } = this.state
    const { locations, subLocations, currentLocation } = this.props
    const locationName = locations.filter(location => location.key === currentLocation).map(it => it.name)[0]
    if (activeSubLocation && activeSubLocation !== '--') {
      const subLocationName = subLocations.filter(location => location.key === activeSubLocation).map(it => it.name)[0]
      return `${locationName} -  ${subLocationName}`
    }
    return locationName
  }

  render() {
    const title = this.titleString()
    return (
      <Page title={title} alwaysRender>
        <ResultsHouseblock
          handlePrint={this.handlePrint}
          handleSubLocationChange={this.handleSubLocationChange}
          setColumnSort={this.setColumnSort}
          update={this.update}
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

  // mapStateToProps
  agencyId: PropTypes.string.isRequired,
  currentLocation: PropTypes.string.isRequired,
  currentSubLocation: PropTypes.string.isRequired,
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
  setLoadedDispatch: PropTypes.func.isRequired,
  sortOrderDispatch: PropTypes.func.isRequired,
  subLocationDispatch: PropTypes.func.isRequired,

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
  houseblockData: state.events.houseBlockData,
  loaded: state.app.loaded,
  orderField: state.events.orderField,
  paymentReasonReasons: state.events.paymentReasonReasons,
  sortOrder: state.events.sortOrder,
  locations: state.search.locations,
  subLocations: extractSubLocations(state.search.locations, state.search.location),
  error: state.app.error,
})

const mapDispatchToProps = dispatch => ({
  houseblockDataDispatch: data => dispatch(setHouseblockData(data)),
  orderDispatch: field => dispatch(setOrderField(field)),
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
  sortOrderDispatch: field => dispatch(setSortOrder(field)),
  subLocationDispatch: text => dispatch(setSearchSubLocation(text)),
})

export { extractSubLocations }

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ResultsHouseblockContainer)
)
