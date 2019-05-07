import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { H3 } from '@govuk-react/heading'
import { resetError, setLoaded } from '../redux/actions'
import Page from '../Components/Page'
import IepHistory from './IepHistory'
import CurrentIepLevel from './CurrentIepLevel'

const axios = require('axios')

class IepHistoryContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      iepSummary: {},
      location: '',
    }
  }

  componentDidMount() {
    this.getIepHistory()
  }

  componentDidUpdate(previousProps) {}

  getIepHistory = async () => {
    const { offenderNo, handleError, resetErrorDispatch, setLoadedDispatch } = this.props
    const response = await axios.get(`/api/bookings/${offenderNo}/iepSummary`)
    this.setState({ iepSummary: response.data, location: `IEP history for ${response.data.offenderName}` })

    try {
      resetErrorDispatch()
      setLoadedDispatch(false)
      setLoadedDispatch(true)
    } catch (error) {
      handleError(error)
    }
  }

  render() {
    const { iepSummary, location } = this.state

    return (
      <Page title={location}>
        <CurrentIepLevel
          level={iepSummary.currentIepLevel}
          days={iepSummary.daysOnIepLevel}
          nextReviewDate={iepSummary.nextReviewDate}
        />
        <IepHistory iepHistory={iepSummary.iepHistory} />
      </Page>
    )
  }
}

IepHistoryContainer.propTypes = {
  offenderNo: PropTypes.string.isRequired,
  handleError: PropTypes.func.isRequired,
  // history from Redux Router Route
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,

  // redux dispatch
  resetErrorDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  error: state.app.error,
})

const mapDispatchToProps = dispatch => ({
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IepHistoryContainer)
