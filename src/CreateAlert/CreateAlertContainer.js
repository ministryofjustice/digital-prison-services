import React, { Component } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { connect } from 'react-redux'
import { notify } from 'react-notify-toast'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'

import OffenderPage from '../OffenderPage/OffenderPage'
import CreateAlertForm from './CreateAlertForm'

export class CreateAlertContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      alertTypes: [],
      alertSubTypes: [],
    }

    this.createAlertHandler = this.createAlertHandler.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  async componentDidMount() {
    const response = await axios.get('/api/get-alert-types')
    this.setState(state => ({
      ...state,
      ...response.data,
    }))
  }

  async createAlertHandler(values) {
    const { offenderDetails, handleError, history, raiseAnalyticsEvent, resetErrorDispatch } = this.props
    const { bookingId } = offenderDetails
    const { alertType, alertSubType, comment, effectiveDate } = values

    resetErrorDispatch()
    try {
      await axios.post(`/api/create-alert/${bookingId}`, {
        alertType,
        alertSubType,
        comment,
        effectiveDate,
      })
      raiseAnalyticsEvent({
        category: 'alert created',
        label: 'Alerts',
        value: { alertType, alertSubType, comment, effectiveDate },
      })
      notify.show('Alert has been created', 'success')
      history.goBack()
    } catch (error) {
      handleError(error)
    }
  }

  cancel() {
    const { history } = this.props

    history.goBack()
  }

  render() {
    const { offenderNo, handleError, setLoadedDispatch, offenderDetails } = this.props
    const { alertTypes, alertSubTypes } = this.state
    return (
      <>
        <GridRow>
          <GridCol columnOneHalf>
            <OffenderPage
              alwaysRender
              title={() => `Create alert`}
              handleError={handleError}
              offenderNumber={offenderNo}
              setLoaded={setLoadedDispatch}
            />
          </GridCol>
        </GridRow>
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
          <GridCol columnOneHalf>
            <CreateAlertForm
              cancelHandler={this.cancel}
              createAlertHandler={this.createAlertHandler}
              alertTypes={alertTypes}
              alertSubTypes={alertSubTypes}
            />
          </GridCol>
        </GridRow>
      </>
    )
  }
}

CreateAlertContainer.propTypes = {
  offenderNo: PropTypes.string.isRequired,
  offenderDetails: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }).isRequired,
  handleError: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  error: state.app.error,
  offenderDetails: state.offenderDetails,
  activeCaseLoadId: state.app.user.activeCaseLoadId,
})

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateAlertContainer)
