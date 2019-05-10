import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'

import Page from '../Components/Page'
import IepHistory from './IepHistory'
import CurrentIepLevel from './CurrentIepLevel'
import IepHistoryForm from './IepHistoryForm'
import { setIepHistoryResults, setIepHistoryFilter} from '../redux/actions'

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

  getIepHistory = async ({ establishment, level, fromDate, toDate }) => {
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
      const { data: results, headers } = await axios.get(`/api/bookings/${offenderNo}/iepSummary`)

      setResults({ ...results })
    } catch (error) {
      handleError(error)
    }

    setLoadedDispatch(true)
  }

  applyFilter = async formValues => {
    this.updateResults({ ...formValues })
  }

  updateResults = fields => {
    const { setIepHistoryFilter: setFilter } = this.props
    setFilter(fields)
    return this.getIepHistory(fields)
  }

  reset = () => this.updateResults({ establishment: null, level: null, fromDate: null, toDate: null })

  render() {
    return (
      <Page title="">
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
