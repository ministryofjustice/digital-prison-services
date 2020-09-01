import React, { Component } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { connect } from 'react-redux'
import { notify } from 'react-notify-toast'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import { setIepHistoryResults, setPossibleIepLevels } from '../redux/actions'
import OffenderPage from '../OffenderPage/OffenderPage'
import IncentiveLevelChangeForm from './IncentiveLevelChangeForm'
import { ChangeAbandonment, LevelSelected } from './IncentiveLevelChangeGaEvents'

class IncentiveLevelChangeContainer extends Component {
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
      activeCaseLoadId,
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
        params: { currentIepLevel: results.currentIepLevel, agencyId: activeCaseLoadId },
      })
      setLevels(levels)
    } catch (error) {
      handleError(error)
    }

    setLoadedDispatch(true)
  }

  changeIepLevel = async values => {
    const {
      offenderNo,
      handleError,
      levels,
      history,
      raiseAnalyticsEvent,
      currentIepLevel,
      activeCaseLoadId,
    } = this.props
    const level = levels.find(l => l.value === values.level)

    try {
      await axios.post(`/api/offenders/${offenderNo}/change-incentive-level`, {
        iepLevel: values.level,
        comment: values.reason,
      })
      raiseAnalyticsEvent(LevelSelected(level.title, currentIepLevel, activeCaseLoadId))
      history.goBack()
      notify.show(`Incentive Level successfully changed to ${level.title}`, 'success')
    } catch (error) {
      handleError(error)
    }
  }

  cancel = () => {
    const { raiseAnalyticsEvent, history } = this.props
    raiseAnalyticsEvent(ChangeAbandonment())
    history.goBack()
  }

  render() {
    const { offenderNo, handleError, setLoadedDispatch, currentIepLevel, offenderDetails, levels } = this.props

    return (
      <OffenderPage
        title={() => `Change incentive level`}
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
        <IncentiveLevelChangeForm cancelHandler={this.cancel} levels={levels} changeIepLevel={this.changeIepLevel} />
      </OffenderPage>
    )
  }
}

IncentiveLevelChangeContainer.defaultProps = {
  currentIepLevel: '',
  levels: [],
  offenderNo: null,
}

IncentiveLevelChangeContainer.propTypes = {
  offenderNo: PropTypes.string,
  currentIepLevel: PropTypes.string,
  activeCaseLoadId: PropTypes.string.isRequired,
  offenderDetails: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }).isRequired,
  levels: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  handleError: PropTypes.func.isRequired,
  setIepHistoryResults: PropTypes.func.isRequired,
  setPossibleIepLevels: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  // history from Redux Router Route
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,

  // redux dispatch
  resetErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  error: state.app.error,
  currentIepLevel: state.iepHistory.currentIepLevel,
  offenderDetails: state.offenderDetails,
  activeCaseLoadId: state.app.user.activeCaseLoadId,
  levels: state.iepLevels.levels,
})

const mapDispatchToProps = {
  setIepHistoryResults,
  setPossibleIepLevels,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IncentiveLevelChangeContainer)
