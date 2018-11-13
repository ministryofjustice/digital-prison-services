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
} from '../redux/actions'

const axios = require('axios')

class GlobalSearchContainer extends Component {
  constructor(props) {
    super(props)
    const { titleDispatch } = this.props
    titleDispatch('Global search')
    this.doGlobalSearch = this.doGlobalSearch.bind(this)
    this.handlePageAction = this.handlePageAction.bind(this)
    this.handleSearchTextChange = this.handleSearchTextChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
  }

  async componentWillMount() {
    const { setLoadedDispatch, handleError, searchTextDispatch, location } = this.props
    const { searchText } = queryString.parse(location.search)
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
    const { pageSize, totalRecordsDispatch, dataDispatch, pageNumberDispatch, raiseAnalyticsEvent } = this.props

    const response = await axios.get('/api/globalSearch', {
      params: {
        searchText,
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
    const { handleError, searchText } = this.props

    try {
      await this.doGlobalSearch(pageNumber, searchText)
    } catch (error) {
      handleError(error)
    }
  }

  async handleSearch(history) {
    const { searchText } = this.props
    history.replace(`/globalsearch?searchText=${searchText}`)
    await this.doGlobalSearch(0, searchText)
  }

  handleSearchTextChange(event) {
    const { searchTextDispatch } = this.props
    searchTextDispatch(event.target.value)
  }

  render() {
    const { loaded, error } = this.props

    if (!loaded) return <Spinner />
    return (
      <div>
        <Error error={error} />
        <GlobalSearch
          handlePageAction={this.handlePageAction}
          handleSearchTextChange={this.handleSearchTextChange}
          handleSearch={this.handleSearch}
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
  titleDispatch: PropTypes.func.isRequired,

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
  error: state.app.error,
})

const mapDispatchToProps = dispatch => ({
  dataDispatch: data => dispatch(setGlobalSearchResults(data)),
  searchTextDispatch: text => dispatch(setGlobalSearchText(text)),
  pageNumberDispatch: no => dispatch(setGlobalSearchPageNumber(no)),
  totalRecordsDispatch: no => dispatch(setGlobalSearchTotalRecords(no)),
  titleDispatch: title => dispatch(setApplicationTitle(title)),
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(GlobalSearchContainer)
)
