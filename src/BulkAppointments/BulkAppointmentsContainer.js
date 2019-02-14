import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import BackLink from '@govuk-react/back-link'
import axios from 'axios'
import moment from 'moment'

import Page from '../Components/Page'
import { setApplicationTitle, setLoaded, resetError, hideModal } from '../redux/actions'

import AppointmentForm from './AppointmentForm'
import ChooseOffenders from './ChooseOffenders'
import OffenderTable from './OffenderTable'
import WithDataSource from '../WithDataSource/WirhDataSource'

const createFileFormDataFromEvent = event => {
  const files = Array.from(event.target.files)
  const file = files[0]

  const formData = new FormData()
  formData.append('offenders', file)

  return formData
}

class BulkAppointmentsContainer extends Component {
  constructor() {
    super()
    this.state = {
      appointmentTypes: [],
      currentStep: 0,
      offenders: [],
      appointment: {},
    }
  }

  async componentDidMount() {
    const { titleDispatch, setLoadedDispatch, resetErrorDispatch } = this.props

    resetErrorDispatch()
    setLoadedDispatch(true)

    titleDispatch('Whereabouts')
  }

  async onFileInputChanged(event) {
    const { handleError, resetErrorDispatch } = this.props
    resetErrorDispatch()

    try {
      event.preventDefault()
      const formData = createFileFormDataFromEvent(event)

      const response = await axios.post('/api/appointments/upload-offenders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      this.setState({
        offenders: response.data,
      })
    } catch (error) {
      handleError(error)
    }
  }

  BackToAppointmentDetails() {
    const { appointmentTypes, appointment } = this.state
    this.setState({
      appointmentTypes,
      appointment,
      currentStep: 0,
    })
  }

  render() {
    const { agencyId } = this.props
    const { offenders, currentStep } = this.state

    const steps = [
      <WithDataSource
        request={{ url: '/api/bulk-appointments/view-model', params: { agencyId } }}
        render={({ data, error }) => (
          <AppointmentForm
            now={moment()}
            appointmentTypes={data.appointmentTypes}
            error={error}
            locationTypes={data.locationTypes}
            trySubmit={values =>
              this.setState(state => ({
                ...state,
                currentStep: currentStep + 1,
                appointment: values,
              }))
            }
          />
        )}
      />,

      <div>
        <BackLink onClick={() => this.BackToAppointmentDetails()}> Back</BackLink>
        <ChooseOffenders onFileInputChanged={event => this.onFileInputChanged(event)} />
        <OffenderTable offenders={offenders} />
      </div>,
    ]
    return (
      <Page title="Add bulk appointments">
        <div>{steps[currentStep]}</div>
      </Page>
    )
  }
}

BulkAppointmentsContainer.propTypes = {
  titleDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  agencyId: PropTypes.string.isRequired,
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
})
const mapDispatchToProps = dispatch => ({
  titleDispatch: title => dispatch(setApplicationTitle(title)),
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BulkAppointmentsContainer)
