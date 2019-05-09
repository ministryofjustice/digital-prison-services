import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import moment from 'moment'
import Page from '../../Components/Page'
import AdjudicationHistoryForm from './AdjudicationHistoryForm'
import AdjudicationHistoryTable from './AdjudicationHistoryTable'
import {
  setAdjudicationHistoryResults,
  setAdjudicationHistoryFilter,
  setAdjudicationHistoryPageNumber,
  setAdjudicationHistoryPageSize,
} from '../../redux/actions'

export class AdjudicationHistoryContainer extends Component {
  componentDidMount = () => {
    this.loadAdjudications({})
  }

  componentDidUpdate = prevProps => {
    const { offenderNumber } = this.props

    if (offenderNumber !== prevProps.offenderNumber) {
      this.loadAdjudications({})
    }
  }

  changePage = async page => {
    const { setAdjudicationHistoryPageNumber: setPageNumber, fieldValues } = this.props
    await setPageNumber(page)
    this.updateResults(fieldValues)
  }

  changePerPage = async pageSize => {
    const { setAdjudicationHistoryPageSize: setPageSize } = this.props
    await setPageSize(Number(pageSize))
    this.changePage(0)
  }

  applyFilter = async formValues => {
    const { setAdjudicationHistoryPageNumber: setPageNumber } = this.props
    await setPageNumber(0)
    this.updateResults({ ...formValues })
  }

  reset = () => this.updateResults({ offenceId: null, establishment: null, fromDate: null, toDate: null })

  updateResults = fields => {
    const { setAdjudicationHistoryFilter: setFilter } = this.props
    setFilter(fields)
    return this.loadAdjudications(fields)
  }

  loadAdjudications = async ({ offenceId, establishment, fromDate, toDate }) => {
    const {
      setAdjudicationHistoryResults: setResults,
      offenderNumber,
      pageNumber,
      pageSize,
      setLoadedDispatch,
      resetErrorDispatch,
      handleError,
    } = this.props

    resetErrorDispatch()
    setLoadedDispatch(false)
    try {
      const { data: adjudications, headers } = await axios.get(`/api/adjudications/${offenderNumber}`, {
        params: {
          offenceId,
          agencyId: establishment,
          fromDate: fromDate && fromDate.format('YYYY-MM-DD'),
          toDate: toDate && toDate.format('YYYY-MM-DD'),
        },
        headers: {
          'Page-Offset': pageNumber * pageSize,
          'Page-Limit': pageSize,
        },
      })

      const totalRecords = parseInt(headers['total-records'], 10)

      setResults({
        ...adjudications,
        totalRecords,
      })
    } catch (error) {
      handleError(error)
    }
    setLoadedDispatch(true)
  }

  render = () => (
    <Page title="Adjudication history">
      <AdjudicationHistoryForm search={this.applyFilter} reset={this.reset} />
      <AdjudicationHistoryTable changePage={this.changePage} changePerPage={this.changePerPage} />
    </Page>
  )
}

AdjudicationHistoryContainer.propTypes = {
  // props
  offenderNumber: PropTypes.string.isRequired,
  handleError: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,

  // mapStateToProps
  pageNumber: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  setAdjudicationHistoryResults: PropTypes.func.isRequired,
  setAdjudicationHistoryFilter: PropTypes.func.isRequired,
  setAdjudicationHistoryPageNumber: PropTypes.func.isRequired,
  setAdjudicationHistoryPageSize: PropTypes.func.isRequired,
  fieldValues: PropTypes.shape({
    establishment: PropTypes.string,
    offenceId: PropTypes.string,
    fromDate: PropTypes.instanceOf(moment),
    toDate: PropTypes.instanceOf(moment),
  }).isRequired,
}

const mapStateToProps = state => ({
  pageNumber: state.adjudicationHistory.pageNumber,
  pageSize: state.adjudicationHistory.pageSize,
  fieldValues: {
    establishment: state.adjudicationHistory.establishment,
    offenceId: state.adjudicationHistory.offenceId,
    fromDate: state.adjudicationHistory.fromDate,
    toDate: state.adjudicationHistory.toDate,
  },
})

const mapDispatchToProps = {
  setAdjudicationHistoryResults,
  setAdjudicationHistoryFilter,
  setAdjudicationHistoryPageNumber,
  setAdjudicationHistoryPageSize,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdjudicationHistoryContainer)
