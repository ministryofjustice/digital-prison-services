import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'

import { H3 } from '@govuk-react/header'
import Button from '@govuk-react/button'
import { ButtonArrow } from '@govuk-react/icons'
import BackLink from '@govuk-react/back-link'

import { Container } from './BulkAppointmentsContainer.styles'
import ChooseOffenders from './ChooseOffenders'
import Page from '../Components/Page'
import { setApplicationTitle, setLoaded, resetError } from '../redux/actions'
import AppointmentDetailsForm from './AppointmentDetailsForm'
import AddAppointmentForm from './AddAppointmentForm'
import WithDataSource from '../WithDataSource/WirhDataSource'

import {
  NumberOfAppointmentsEvent,
  AppointmentTypeUsed,
  RecordWhenTheStartTimesHaveBeenAmended,
  RecordAbandonment,
} from './BulkAppointmentsGaEvents'

const defaultState = {
  currentStep: 0,
  offenders: [],
  appointment: {},
}

class BulkAppointmentsContainer extends Component {
  constructor() {
    super()
    this.state = {
      ...defaultState,
    }
  }

  async componentDidMount() {
    const { titleDispatch, setLoadedDispatch, resetErrorDispatch } = this.props

    resetErrorDispatch()
    setLoadedDispatch(true)

    titleDispatch('Whereabouts')
  }

  onBulkAppointmentsCreated({ appointments }) {
    this.raiseEvents({ appointments })
    this.setState({
      ...defaultState,
      complete: true,
    })
  }

  setAppointmentDetails({ appointment }) {
    this.setState(state => ({
      ...state,
      currentStep: 1,
      appointment,
    }))
  }

  raiseEvents({ appointments }) {
    const { raiseAnalyticsEvent, agencyId } = this.props
    const { appointment } = this.state

    raiseAnalyticsEvent(NumberOfAppointmentsEvent({ total: appointments.length, agencyId }))
    raiseAnalyticsEvent(
      AppointmentTypeUsed({
        total: appointments.length,
        appointmentType: appointment.appointmentType,
      })
    )
    raiseAnalyticsEvent(
      RecordWhenTheStartTimesHaveBeenAmended({
        appointmentsDefaults: appointment,
        appointments,
      })
    )
  }

  previousStep() {
    this.setState(state => ({
      ...state,
      currentStep: state.currentStep - 1,
    }))
  }

  render() {
    const { agencyId, handleError, resetErrorDispatch, notmEndpointUrl, raiseAnalyticsEvent, now } = this.props
    const { complete, offenders, currentStep, appointment } = this.state

    return (
      <Page title="Add bulk appointments" alwaysRender>
        {complete && (
          <div>
            <H3> Appointments have been successfully created. </H3>
            <div>
              <Button
                onClick={() =>
                  this.setState({
                    ...defaultState,
                    complete: false,
                  })
                }
                icon={<ButtonArrow />}
              >
                Start again
              </Button>
            </div>
          </div>
        )}
        {!complete && (
          <div>
            {currentStep === 0 && (
              <WithDataSource
                request={{ url: '/api/bulk-appointments/view-model', params: { agencyId } }}
                render={({ data, error }) => (
                  <AppointmentDetailsForm
                    initialValues={appointment}
                    now={now}
                    appointmentTypes={data.appointmentTypes}
                    error={error}
                    locationTypes={data.locationTypes}
                    onCancel={event => {
                      event.preventDefault()
                      raiseAnalyticsEvent(RecordAbandonment())
                      window.location = notmEndpointUrl
                    }}
                    onSuccess={values => this.setAppointmentDetails({ appointment: values })}
                  />
                )}
              />
            )}
            {currentStep === 1 && (
              <Container>
                <BackLink onClick={() => this.previousStep()}> Back</BackLink>
                <ChooseOffenders
                  onError={error => handleError(error)}
                  onSuccess={data => {
                    resetErrorDispatch()
                    this.setState(state => ({
                      ...state,
                      offenders: null,
                    }))
                    this.setState(state => ({
                      ...state,
                      offenders: data,
                    }))
                  }}
                />
                <AddAppointmentForm
                  onError={error => handleError(error)}
                  resetErrors={resetErrorDispatch}
                  onCancel={event => {
                    event.preventDefault()
                    raiseAnalyticsEvent(RecordAbandonment())
                    window.location = notmEndpointUrl
                  }}
                  onSuccess={appointments => this.onBulkAppointmentsCreated({ appointments })}
                  appointment={appointment}
                  offenders={offenders}
                  now={now}
                  date={appointment.date}
                  startTime={appointment.startTime}
                />
              </Container>
            )}
          </div>
        )}
      </Page>
    )
  }
}

BulkAppointmentsContainer.propTypes = {
  titleDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  agencyId: PropTypes.string.isRequired,
  handleError: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  notmEndpointUrl: PropTypes.string.isRequired,
  now: PropTypes.instanceOf(moment),
}

BulkAppointmentsContainer.defaultProps = {
  now: moment(),
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  notmEndpointUrl: state.app.config.notmEndpointUrl,
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
