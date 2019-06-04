import React, { Component } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { connect } from 'react-redux'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import { setIepHistoryResults, setPossibleIepLevels } from '../redux/actions'
import OffenderPage from '../OffenderPage/OffenderPage'
import IepChangeForm from './IepChangeForm'

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
      setPossibleIepLevels: setLevels,
    } = this.props

    resetErrorDispatch()
    setLoadedDispatch(false)

    try {
      const { data: results } = await axios.get(`/api/bookings/${offenderNo}/iepSummary`)

      setResults({ ...results })

      const { data: levels } = await axios.get(`/api/iep-levels`, {
        params: { currentIepLevel: results.currentIepLevel },
      })
      setLevels(levels)
    } catch (error) {
      handleError(error)
    }

    setLoadedDispatch(true)
  }

  changeIepLevel = async values => {
    const { offenderNo, handleError, history } = this.props

    try {
      await axios.post(`/api/offenders/${offenderNo}/change-iep-level`, {
        iepLevel: values.level,
        comment: values.reason,
      })
      history.push(`/offenders/${offenderNo}/iep-details`)
    } catch (error) {
      handleError(error)
    }
  }

  cancel = () => {
    const { offenderNo, history } = this.props
    history.push(`/offenders/${offenderNo}/iep-details`)
  }

  render() {
    const {
      offenderNo,
      handleError,
      setLoadedDispatch,
      currentIepLevel,
      offenderDetails,
      userRoles,
      levels,
      history,
    } = this.props

    if (!userRoles.includes('MAINTAIN_IEP')) {
      history.push(`/offenders/${offenderNo}/iep-details`)
    }

    return (
      <OffenderPage
        title={() => `Change IEP level`}
        handleError={handleError}
        offenderNumber={offenderNo}
        setLoaded={setLoadedDispatch}
      >
        <GridRow>
          <GridCol>
            <p className="label margin-bottom-small">Name</p>
            <p>
              <strong>
                {offenderDetails.firstName} {offenderDetails.lastName} ({offenderNo})
              </strong>
            </p>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol>
            <p className="label margin-bottom-small">Current level</p>
            <strong>{currentIepLevel}</strong>
          </GridCol>
        </GridRow>
        <IepChangeForm cancelHandler={this.cancel} levels={levels} changeIepLevel={this.changeIepLevel} />
      </OffenderPage>
    )
  }
}

IepChangeContainer.defaultProps = {
  currentIepLevel: '',
  levels: [],
}

IepChangeContainer.propTypes = {
  offenderNo: PropTypes.string.isRequired,
  currentIepLevel: PropTypes.string,
  offenderDetails: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }).isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  levels: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    })
  ),
  handleError: PropTypes.func.isRequired,
  setIepHistoryResults: PropTypes.func.isRequired,
  setPossibleIepLevels: PropTypes.func.isRequired,
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
  userRoles: state.app.user.roles,
  levels: state.iepLevels.levels,
})

const mapDispatchToProps = {
  setIepHistoryResults,
  setPossibleIepLevels,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IepChangeContainer)
