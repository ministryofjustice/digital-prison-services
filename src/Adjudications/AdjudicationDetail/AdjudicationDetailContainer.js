import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'

import { setAdjudicationDetail } from '../../redux/actions'
import OffenderPage from '../../OffenderPage'

import Detail from './Detail'
import Hearing from './Hearing'
import Results from './Results'
import Sanctions from './Sanctions'

export class AdjudicationDetailContainer extends Component {
  componentDidMount = () => {
    this.loadAdjudicationDetails()
  }

  componentDidUpdate = prevProps => {
    const { offenderNumber } = this.props

    if (offenderNumber !== prevProps.offenderNumber) {
      this.loadAdjudicationDetails()
    }
  }

  loadAdjudicationDetails = async () => {
    const {
      setAdjudicationDetail: setResult,
      offenderNumber,
      adjudicationNumber,
      setLoadedDispatch,
      resetErrorDispatch,
      handleError,
    } = this.props

    resetErrorDispatch()
    setLoadedDispatch(false)
    try {
      const { data: adjudicationDetail } = await axios.get(
        `/api/offenders/${offenderNumber}/adjudications/${adjudicationNumber}`
      )

      setResult({
        ...adjudicationDetail,
      })
    } catch (error) {
      handleError(error)
    }
    setLoadedDispatch(true)
  }

  render = () => {
    const { offenderNumber, adjudicationNumber, handleError } = this.props
    return (
      <OffenderPage
        title={() => `Adjudication no. ${adjudicationNumber}`}
        handleError={handleError}
        offenderNumber={offenderNumber}
      >
        <>
          <Detail />
          <Hearing />
          <Results />
          <Sanctions />
        </>
      </OffenderPage>
    )
  }
}

AdjudicationDetailContainer.propTypes = {
  // props
  offenderNumber: PropTypes.string.isRequired,
  adjudicationNumber: PropTypes.string.isRequired,
  handleError: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,

  setAdjudicationDetail: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
  setAdjudicationDetail,
}

export default connect(
  _ => ({}),
  mapDispatchToProps
)(AdjudicationDetailContainer)
