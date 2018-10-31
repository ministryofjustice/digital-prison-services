import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { connect } from 'react-redux'
import axios from 'axios/index'
import {
  setSearchLocation,
  setSearchLocations,
  setSearchActivity,
  resetValidationErrors,
  setValidationError,
} from '../redux/actions'
import Error from '../Error'
import Search from './Search'
import { defaultPeriod } from '../redux/reducers'

class SearchContainer extends Component {
  constructor() {
    super()
    this.onActivityChange = this.onActivityChange.bind(this)
    this.onLocationChange = this.onLocationChange.bind(this)
    this.validate = this.validate.bind(this)
    this.onSearch = this.onSearch.bind(this)
  }

  componentWillMount() {
    const { dateDispatch, periodDispatch, getActivityLocations } = this.props
    this.getLocations()
    const today = 'Today'
    dateDispatch(today)
    const currentPeriod = defaultPeriod(moment())
    periodDispatch(currentPeriod)
    getActivityLocations(today, currentPeriod)
  }

  onActivityChange(event) {
    const {
      target: { value },
    } = event
    const { locationDispatch, activityDispatch } = this.props

    if (value !== '--') locationDispatch('--')

    activityDispatch(event.target.value)
  }

  onLocationChange(event) {
    const {
      target: { value },
    } = event
    const { locationDispatch, activityDispatch } = this.props

    if (value !== '--') activityDispatch('--')

    locationDispatch(event.target.value)
  }

  onSearch(history) {
    const { handleSearch } = this.props

    if (!this.validate()) {
      return
    }
    handleSearch(history)
  }

  async getLocations() {
    const { agencyId, locationsDispatch, handleError } = this.props

    try {
      const response = await axios.get('/api/houseblockLocations', {
        params: {
          agencyId,
        },
      })
      locationsDispatch(response.data)
    } catch (error) {
      handleError(error)
    }
  }

  validate() {
    const { activity, location, setValidationErrorDispatch, resetValidationErrorsDispatch } = this.props

    if (activity === '--' && location === '--') {
      setValidationErrorDispatch('searchForm', 'Please select location or activity')
      return false
    }
    resetValidationErrorsDispatch()
    return true
  }

  render() {
    const { error, location } = this.props

    if (error) {
      return <Error error={error} />
    }
    return (
      <Search
        onSearch={this.onSearch}
        onLocationChange={this.onLocationChange}
        onActivityChange={this.onActivityChange}
        currentLocation={location}
        {...this.props}
      />
    )
  }
}

SearchContainer.propTypes = {
  // props
  dateDispatch: PropTypes.func.isRequired,
  periodDispatch: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  getActivityLocations: PropTypes.func.isRequired,

  // mapStateToProps
  agencyId: PropTypes.string.isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({ locationId: PropTypes.number.isRequired, userDescription: PropTypes.string.isRequired })
  ),
  activity: PropTypes.string.isRequired,
  locations: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  location: PropTypes.string.isRequired,
  loaded: PropTypes.bool.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  validationErrors: PropTypes.shape({ searchForm: PropTypes.string }),

  // mapDispatchToProps
  locationDispatch: PropTypes.func.isRequired,
  locationsDispatch: PropTypes.func.isRequired,
  activityDispatch: PropTypes.func.isRequired,
  setValidationErrorDispatch: PropTypes.func.isRequired,
  resetValidationErrorsDispatch: PropTypes.func.isRequired,

  // other?
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),
}

SearchContainer.defaultProps = {
  validationErrors: {},
  activities: [],
  error: '',
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  activities: state.search.activities,
  activity: state.search.activity,
  locations: state.search.locations.map(l => l.name),
  location: state.search.location,
  loaded: state.app.loaded,
  date: state.search.date,
  period: state.search.period,
  validationErrors: state.app.validationErrors,
})

const mapDispatchToProps = dispatch => ({
  locationsDispatch: locations => dispatch(setSearchLocations(locations)),
  locationDispatch: text => dispatch(setSearchLocation(text)),
  activityDispatch: text => dispatch(setSearchActivity(text)),
  setValidationErrorDispatch: (fieldName, message) => dispatch(setValidationError(fieldName, message)),
  resetValidationErrorsDispatch: () => dispatch(resetValidationErrors()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchContainer)
