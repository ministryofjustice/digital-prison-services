import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import queryString from 'query-string'
import Error from '../Error'
import Spinner from '../Spinner'
import GlobalSearch from './GlobalSearch'
import {
  setGlobalSearchResults,
  setGlobalSearchText,
  setGlobalSearchPageNumber,
  setGlobalSearchTotalRecords,
  setApplicationTitle,
  setGlobalSearchLocationFilter,
  setGlobalSearchGenderFilter,
  resetError,
  setGlobalSearchDateOfBirthFilter,
} from '../redux/actions'

const axios = require('axios')

class GlobalSearchContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      validForm: true,
    }
    const { titleDispatch } = this.props
    titleDispatch('Global search')
    this.doGlobalSearch = this.doGlobalSearch.bind(this)
    this.handlePageAction = this.handlePageAction.bind(this)
    this.handleSearchTextChange = this.handleSearchTextChange.bind(this)
    this.handleSearchLocationFilterChange = this.handleSearchLocationFilterChange.bind(this)
    this.handleSearchGenderFilterChange = this.handleSearchGenderFilterChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.clearFilters = this.clearFilters.bind(this)
    this.handleDateOfBirthChange = this.handleDateOfBirthChange.bind(this)
  }

  async componentWillMount() {
    const { setLoadedDispatch, handleError, searchTextDispatch, location, resetErrorDispatch } = this.props
    const { searchText } = queryString.parse(location.search)
    resetErrorDispatch()
    searchTextDispatch(searchText)
    setLoadedDispatch(false)
    try {
      await this.doGlobalSearch(0, searchText)
    } catch (error) {
      handleError(error)
    }
    setLoadedDispatch(true)
  }

  async doGlobalSearch(pageNumber, searchText) {
    const {
      pageSize,
      totalRecordsDispatch,
      dataDispatch,
      pageNumberDispatch,
      raiseAnalyticsEvent,
      genderFilter,
      locationFilter,
      dateOfBirthFilter,
    } = this.props

    const response = await axios.get('/api/globalSearch', {
      params: {
        searchText,
        genderFilter,
        locationFilter,
        dateOfBirthFilter: dateOfBirthFilter.isoDate,
      },
      headers: {
        'Page-Offset': pageSize * pageNumber,
        'Page-Limit': pageSize,
      },
    })
    totalRecordsDispatch(parseInt(response.headers['total-records'], 10))
    dataDispatch(response.data)
    pageNumberDispatch(pageNumber)
    raiseAnalyticsEvent({
      category: 'Global search',
      action: `search page ${pageNumber} shown`,
    })
  }

  async handlePageAction(pageNumber) {
    const { handleError, searchText, resetErrorDispatch } = this.props

    resetErrorDispatch()

    try {
      await this.doGlobalSearch(pageNumber, searchText)
    } catch (error) {
      handleError(error)
    }
  }

  async handleSearch(history) {
    const { searchText, handleError, resetErrorDispatch } = this.props

    resetErrorDispatch()
    const { searchText, dateOfBirthFilter } = this.props
    const validForm = dateOfBirthFilter.blank || dateOfBirthFilter.valid
    this.setState(state => ({
      ...state,
      validForm,
    }))

    if (!validForm) return

    history.replace(`/globalsearch?searchText=${searchText}`)

    try {
      await this.doGlobalSearch(0, searchText)
    } catch (error) {
      handleError(error)
    }
  }

  handleSearchTextChange(event) {
    const { searchTextDispatch } = this.props
    searchTextDispatch(event.target.value)
  }

  handleSearchLocationFilterChange(event) {
    const { locationFilterDispatch } = this.props
    locationFilterDispatch(event.target.value)
  }

  handleSearchGenderFilterChange(event) {
    const { genderFilterDispatch } = this.props
    genderFilterDispatch(event.target.value)
  }

  clearFilters() {
    const { genderFilterDispatch, locationFilterDispatch } = this.props
    genderFilterDispatch('ALL')
    locationFilterDispatch('ALL')
  }

  handleDateOfBirthChange(value) {
    const { dateOfBirthDispatch } = this.props
    dateOfBirthDispatch(value)
  }

  render() {
    const { loaded, error } = this.props
    const { validForm } = this.state

    if (!loaded) return <Spinner />
    return (
      <div>
        <Error error={error} />
        <GlobalSearch
          handlePageAction={this.handlePageAction}
          handleSearchTextChange={this.handleSearchTextChange}
          handleSearchLocationFilterChange={this.handleSearchLocationFilterChange}
          handleSearchGenderFilterChange={this.handleSearchGenderFilterChange}
          handleSearch={this.handleSearch}
          clearFilters={this.clearFilters}
          handleDateOfBirthChange={this.handleDateOfBirthChange}
          showErrors={!validForm}
          {...this.props}
        />
      </div>
    )
  }
}

GlobalSearchContainer.propTypes = {
  // props
  handleError: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,

  // mapStateToProps
  loaded: PropTypes.bool.isRequired,
  agencyId: PropTypes.string.isRequired,
  searchText: PropTypes.string.isRequired,
  genderFilter: PropTypes.string.isRequired,
  locationFilter: PropTypes.string.isRequired,
  dateOfBirthFilter: PropTypes.shape({
    blank: PropTypes.bool.isRequired,
    valid: PropTypes.bool.isRequired,
    isoDate: PropTypes.string,
  }).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      dateOfBirth: PropTypes.string.isRequired,
      latestLocation: PropTypes.string.isRequired,
      agencyId: PropTypes.string,
    })
  ).isRequired,
  pageNumber: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalRecords: PropTypes.number.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),

  // mapDispatchToProps
  dataDispatch: PropTypes.func.isRequired,
  pageNumberDispatch: PropTypes.func.isRequired,
  totalRecordsDispatch: PropTypes.func.isRequired,
  searchTextDispatch: PropTypes.func.isRequired,
  genderFilterDispatch: PropTypes.func.isRequired,
  locationFilterDispatch: PropTypes.func.isRequired,
  titleDispatch: PropTypes.func.isRequired,
  dateOfBirthDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,

  // special
  location: ReactRouterPropTypes.location.isRequired,
}

GlobalSearchContainer.defaultProps = {
  error: '',
}

const mapStateToProps = state => ({
  loaded: state.app.loaded,
  agencyId: state.app.user.activeCaseLoadId,
  data: state.globalSearch.data,
  pageNumber: state.globalSearch.pageNumber,
  pageSize: state.globalSearch.pageSize,
  totalRecords: state.globalSearch.totalRecords,
  searchText: state.globalSearch.searchText,
  locationFilter: state.globalSearch.locationFilter,
  genderFilter: state.globalSearch.genderFilter,
  dateOfBirthFilter: state.globalSearch.dateOfBirthFilter,
  error: state.app.error,
})

const mapDispatchToProps = dispatch => ({
  dataDispatch: data => dispatch(setGlobalSearchResults(data)),
  searchTextDispatch: text => dispatch(setGlobalSearchText(text)),
  genderFilterDispatch: text => dispatch(setGlobalSearchGenderFilter(text)),
  locationFilterDispatch: text => dispatch(setGlobalSearchLocationFilter(text)),
  pageNumberDispatch: no => dispatch(setGlobalSearchPageNumber(no)),
  totalRecordsDispatch: no => dispatch(setGlobalSearchTotalRecords(no)),
  titleDispatch: title => dispatch(setApplicationTitle(title)),
  resetErrorDispatch: () => dispatch(resetError()),
  dateOfBirthDispatch: dateOfBirth => dispatch(setGlobalSearchDateOfBirthFilter(dateOfBirth)),
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(GlobalSearchContainer)
)
