import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import moment from 'moment'
import AdjudicationHistoryForm from './AdjudicationHistoryForm'
import AdjudicationHistoryTable from './AdjudicationHistoryTable'
import {
  setAdjudicationHistoryResults,
  setAdjudicationHistoryFilter,
  setAdjudicationHistoryPageNumber,
  setAdjudicationHistoryPageSize,
} from '../../redux/actions'
import OffenderPage from '../../OffenderPage'

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
      const { data: adjudications, headers } = await axios.get(`/api/offenders/${offenderNumber}/adjudications`, {
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

  render = () => {
    const { offenderNumber, handleError } = this.props
    return (
      <OffenderPage
        title={({ firstName, lastName }) => `Adjudication history for ${firstName} ${lastName}`}
        docTitle={`Adjudication history for ${offenderNumber}`}
        handleError={handleError}
        offenderNumber={offenderNumber}
      >
        <AdjudicationHistoryForm search={this.applyFilter} reset={this.reset} />
        <AdjudicationHistoryTable
          offenderNo={offenderNumber}
          changePage={this.changePage}
          changePerPage={this.changePerPage}
        />
      </OffenderPage>
    )
  }
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

const mapStateToProps = ({
  adjudicationHistory: { pageNumber, pageSize, establishment, offenceId, fromDate, toDate },
}) => ({
  pageNumber,
  pageSize,
  fieldValues: {
    establishment,
    offenceId,
    fromDate,
    toDate,
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
