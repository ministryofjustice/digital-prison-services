import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import queryString from 'query-string'
import Error from '../Error'
import Spinner from '../Spinner'
import GlobalSearch from './GlobalSearch'
import { setGlobalSearchResults, setGlobalSearchPageNumber, setGlobalSearchTotalRecords } from '../redux/actions'

const axios = require('axios')

class GlobalSearchContainer extends Component {
  constructor(props) {
    super(props)
    this.doGlobalSearch = this.doGlobalSearch.bind(this)
    this.handlePageAction = this.handlePageAction.bind(this)
  }

  async componentWillMount() {
    const { setLoadedDispatch, handleError } = this.props

    setLoadedDispatch(false)
    try {
      await this.doGlobalSearch(0)
    } catch (error) {
      handleError(error)
    }
    setLoadedDispatch(true)
  }

  async doGlobalSearch(pageNumber) {
    const {
      location,
      pageSize,
      totalRecordsDispatch,
      dataDispatch,
      pageNumberDispatch,
      raiseAnalyticsEvent,
    } = this.props
    const values = queryString.parse(location.search)
    const response = await axios.get('/api/globalSearch', {
      params: {
        searchText: values.searchText,
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
    const { handleError } = this.props

    try {
      await this.doGlobalSearch(pageNumber)
    } catch (error) {
      handleError(error)
    }
  }

  render() {
    const { loaded, error } = this.props

    if (!loaded) return <Spinner />

    return (
      <div>
        <Error error={error} />
        <GlobalSearch handlePageAction={this.handlePageAction} {...this.props} />
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

  // mapDispatchToProps
  dataDispatch: PropTypes.func.isRequired,
  pageNumberDispatch: PropTypes.func.isRequired,
  totalRecordsDispatch: PropTypes.func.isRequired,

  // other?
  error: PropTypes.string,

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
})

const mapDispatchToProps = dispatch => ({
  dataDispatch: data => dispatch(setGlobalSearchResults(data)),
  pageNumberDispatch: no => dispatch(setGlobalSearchPageNumber(no)),
  totalRecordsDispatch: no => dispatch(setGlobalSearchTotalRecords(no)),
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(GlobalSearchContainer)
)
