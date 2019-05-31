import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import { setIepHistoryResults } from '../redux/actions'
import OffenderPage from '../OffenderPage/OffenderPage'
import IepChangeForm from './IepChangeForm'

const axios = require('axios')

class IepChangeContainer extends Component {
  componentDidMount() {
    this.getIepDetails()
  }

  componentDidUpdate = prevProps => {
    const { offenderNo } = this.props

    if (offenderNo !== prevProps.offenderNo) {
      this.getIepDetails()
    }
  }

  getIepDetails = async () => {
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

  cancel = () => {}

  determineImage = (option, current) => {
    if (current === 'Basic') {
      if (option === 'Standard') {
        return '/static/images/Green_arrow.png'
      }
      if (option === 'Enhanced') {
        return '/static/images/Double_green_arrow.png'
      }
    } else if (current === 'Standard') {
      if (option === 'Basic') {
        return '/static/images/Red_arrow.png'
      }
      if (option === 'Enhanced') {
        return '/static/images/Green_arrow.png'
      }
    } else if (current === 'Enhanced') {
      if (option === 'Standard') {
        return '/static/images/Red_arrow.png'
      }
      if (option === 'Basic') {
        return '/static/images/Double_red_arrow.png'
      }
    }

    return ''
  }

  render() {
    const { offenderNo, handleError, setLoadedDispatch, currentIepLevel, offenderDetails } = this.props

    const levels = [
      { title: 'Basic', value: 'BSC', image: this.determineImage('Basic', currentIepLevel) },
      { title: 'Standard', value: 'STD', image: this.determineImage('Standard', currentIepLevel) },
      { title: 'Enhanced', value: 'ENH', image: this.determineImage('Enhanced', currentIepLevel) },
    ].filter(level => level.title !== currentIepLevel)

    return (
      <OffenderPage
        title={() => `Change IEP level`}
        handleError={handleError}
        offenderNumber={offenderNo}
        setLoaded={setLoadedDispatch}
      >
        <GridRow>
          <GridCol setWidth="one-quarter">
            <p className="label margin-bottom-small">Name</p>
            <p>
              <strong>
                {offenderDetails.firstName} {offenderDetails.lastName} ({offenderNo})
              </strong>
            </p>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol setWidth="one-quarter">
            <p className="label margin-bottom-small">Current level</p>
            <strong>{currentIepLevel}</strong>
          </GridCol>
        </GridRow>
        <IepChangeForm cancelHandler={this.cancel} levels={levels} />
      </OffenderPage>
    )
  }
}

IepChangeContainer.propTypes = {
  offenderNo: PropTypes.string.isRequired,
  currentIepLevel: PropTypes.string.isRequired,
  offenderDetails: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }).isRequired,
  handleError: PropTypes.func.isRequired,
  setIepHistoryResults: PropTypes.func.isRequired,
  // history from Redux Router Route
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,

  // redux dispatch
  resetErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  error: state.app.error,
  currentIepLevel: state.iepHistory.currentIepLevel,
  offenderDetails: state.offenderDetails,
})

const mapDispatchToProps = {
  setIepHistoryResults,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IepChangeContainer)
