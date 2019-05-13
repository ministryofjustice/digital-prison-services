import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'

import Page from '../Components/Page'
import IepHistory from './IepHistory'
import CurrentIepLevel from './CurrentIepLevel'
import IepHistoryForm from './IepHistoryForm'
import { setIepHistoryResults, setIepHistoryFilter } from '../redux/actions'

const axios = require('axios')

class IepHistoryContainer extends Component {
  componentDidMount() {
    this.getIepHistory({})
  }

  componentDidUpdate = prevProps => {
    const { offenderNo } = this.props

    if (offenderNo !== prevProps.offenderNo) {
      this.getIepHistory({})
    }
  }

  getIepHistory = async () => {
    const {
      offenderNo,
      handleError,
      resetErrorDispatch,
      setLoadedDispatch,
      setIepHistoryResults: setResults,
    } = this.props

    resetErrorDispatch()
    setLoadedDispatch(false)

    try {
      const { data: results } = await axios.get(`/api/bookings/${offenderNo}/iepSummary`)

      setResults({ ...results })
    } catch (error) {
      handleError(error)
    }

    setLoadedDispatch(true)
  }

  applyFilter = async formValues => {
    this.updateResults({ ...formValues })
  }

  updateResults = async fields => {
    await this.getIepHistory()
    const {
      setIepHistoryFilter: setFilter,
      results,
      resetErrorDispatch,
      setLoadedDispatch,
      setIepHistoryResults: setResults,
    } = this.props
    setFilter(fields)

    resetErrorDispatch()
    setLoadedDispatch(false)

    let filteredResults = results

    if (fields.establishment) {
      filteredResults = filteredResults.filter(result => result.agencyId === fields.establishment)
    }

    if (fields.level) {
      filteredResults = filteredResults.filter(result => result.iepLevel === fields.level)
    }

    if (fields.fromDate) {
      filteredResults = filteredResults.filter(result => moment(result.iepTime).isSameOrAfter(fields.fromDate))
    }

    if (fields.toDate) {
      filteredResults = filteredResults.filter(result => moment(result.iepTime).isSameOrBefore(fields.toDate))
    }

    setResults({ results: filteredResults })
    setLoadedDispatch(true)
  }

  reset = () => {
    const { setIepHistoryFilter: setFilter } = this.props
    setFilter({ establishment: null, level: null, fromDate: null, toDate: null })
    this.getIepHistory()
  }

  render() {
    const { offenderName } = this.props
    return (
      <Page title={`IEP history for ${offenderName}`}>
        <CurrentIepLevel />
        <IepHistoryForm search={this.applyFilter} reset={this.reset} />
        <IepHistory />
      </Page>
    )
  }
}

IepHistoryContainer.propTypes = {
  offenderNo: PropTypes.string.isRequired,
  handleError: PropTypes.func.isRequired,
  setIepHistoryResults: PropTypes.func.isRequired,
  setIepHistoryFilter: PropTypes.func.isRequired,
  // history from Redux Router Route
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
  offenderName: PropTypes.string.isRequired,
  results: PropTypes.arrayOf(
    PropTypes.shape({
      comments: PropTypes.string,
      iepEstablishment: PropTypes.string.isRequired,
      iepStaffMember: PropTypes.string,
      iepTime: PropTypes.string.isRequired,
      formattedTime: PropTypes.string.isRequired,
    })
  ).isRequired,
  fieldValues: PropTypes.shape({
    establishment: PropTypes.string,
    level: PropTypes.string,
    fromDate: PropTypes.instanceOf(moment),
    toDate: PropTypes.instanceOf(moment),
  }).isRequired,

  // redux dispatch
  resetErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  error: state.app.error,
  offenderName: state.iepHistory.offenderName,
  results: state.iepHistory.results,
  fieldValues: {
    establishment: state.iepHistory.establishment,
    level: state.iepHistory.level,
    fromDate: state.iepHistory.fromDate,
    toDate: state.iepHistory.toDate,
  },
})

const mapDispatchToProps = {
  setIepHistoryResults,
  setIepHistoryFilter,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IepHistoryContainer)
