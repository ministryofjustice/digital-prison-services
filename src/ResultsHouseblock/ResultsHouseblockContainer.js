import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import moment from 'moment'
import Error from '../Error'
import ResultsHouseblock from './ResultsHouseblock'
import {
  resetError,
  setLoaded,
  setHouseblockData,
  setOrderField,
  setSearchSubLocation,
  setSortOrder,
} from '../redux/actions'
import Spinner from '../Spinner'
import { getHouseBlockReasons } from '../ModalProvider/PaymentReasonModal/reasonCodes'

const axios = require('axios')

class ResultsHouseblockContainer extends Component {
  constructor(props) {
    super(props)
    this.handleSubLocationChange = this.handleSubLocationChange.bind(this)
    this.getHouseblockList = this.getHouseblockList.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
    this.update = this.update.bind(this)
    this.state = {
      previousSubLocation: null,
    }
  }

  async componentWillMount() {
    const { currentLocation, history } = this.props

    try {
      if (currentLocation) {
        this.getHouseblockList('lastName', 'ASC')
      } else {
        history.push('/whereaboutssearch')
      }
    } catch (error) {
      this.handleError(error)
    }
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
        previousSubLocation: currentSubLocation,
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
          'Sort-Fields': orderField,
          'Sort-Order': sortOrder,
        },
      }

      const response = await axios.get('/api/houseblocklist', config)
      houseblockDataDispatch(response.data)
    } catch (error) {
      handleError(error)
    }
    setLoadedDispatch(true)
  }

  update() {
    const { currentSubLocation, orderField, sortOrder } = this.props
    const { previousSubLocation } = this.state

    if (currentSubLocation === '--') {
      if (previousSubLocation !== '--') {
        this.getHouseblockList('lastName', 'ASC')
      } else {
        this.getHouseblockList(orderField, sortOrder)
      }
    } else if (previousSubLocation === '--') {
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

  render() {
    const { loaded } = this.props

    if (!loaded) {
      return <Spinner />
    }

    return (
      <div>
        <Error {...this.props} />
        <ResultsHouseblock
          handlePrint={this.handlePrint}
          handleSubLocationChange={this.handleSubLocationChange}
          getHouseblockList={this.getHouseblockList}
          update={this.update}
          {...this.props}
        />
      </div>
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
  subLocations: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,

  // mapDispatchToProps
  houseblockDataDispatch: PropTypes.func.isRequired,
  orderDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  sortOrderDispatch: PropTypes.func.isRequired,
  subLocationDispatch: PropTypes.func.isRequired,

  // other?
  error: PropTypes.string,
  // special
  history: ReactRouterPropTypes.history.isRequired,
}

ResultsHouseblockContainer.defaultProps = {
  error: '',
}

const extractSubLocations = (locations, currentLocation) => {
  if (!locations) return []
  if (!currentLocation) return []
  const subLocations = locations.filter(l => l.name === currentLocation).map(l => l.children)
  return subLocations ? subLocations[0].map(l => l.name) : []
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
  subLocations: extractSubLocations(state.search.locations, state.search.location),
})

const mapDispatchToProps = dispatch => ({
  houseblockDataDispatch: data => dispatch(setHouseblockData(data)),
  orderDispatch: field => dispatch(setOrderField(field)),
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
  sortOrderDispatch: field => dispatch(setSortOrder(field)),
  subLocationDispatch: text => dispatch(setSearchSubLocation(text)),
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ResultsHouseblockContainer)
)
