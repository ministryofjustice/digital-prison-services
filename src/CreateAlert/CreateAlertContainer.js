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
      disableSubmit: false,
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
    const { offenderDetails, handleError, history, raiseAnalyticsEvent, resetErrorDispatch, agencyId } = this.props
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

      this.setState(state => ({
        ...state,
        disableSubmit: true,
      }))

      raiseAnalyticsEvent({
        category: 'Alert Created',
        label: `Alert type - ${alertSubType}`,
        action: `Alert created for ${agencyId}`,
      })

      notify.show('Alert has been created', 'success')
      setTimeout(() => history.goBack(), 3000)
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
    const { alertTypes, alertSubTypes, disableSubmit } = this.state
    return (
      <>
        <GridRow>
          <GridCol setWidth="one-half">
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
          <GridCol setWidth="one-half">
            <CreateAlertForm
              cancelHandler={this.cancel}
              createAlertHandler={this.createAlertHandler}
              alertTypes={alertTypes}
              alertSubTypes={alertSubTypes}
              disableSubmit={disableSubmit}
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
  agencyId: PropTypes.string.isRequired,
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
