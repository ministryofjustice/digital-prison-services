import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'

import { H3 } from '@govuk-react/heading'
import Button from '@govuk-react/button'
import { BLACK, GREY_3 } from 'govuk-colours'
import Page from '../../Components/Page'
import { Container, Divider, ButtonContainer } from './AddPrisonersContainer.styles'

import {
  AppointmentTypeUsed,
  NumberOfAppointmentsEvent,
  RecordAbandonment,
  RecordRecurringAppointments,
  RecordWhenTheStartTimesHaveBeenAmended,
} from '../BulkAppointmentsGaEvents'

import { resetError, setLoaded, setAppointmentPrisoners, setBulkAppointmentsComplete } from '../../redux/actions'
import { appointmentType } from '../../types'
import routePaths from '../../routePaths'

import OffenderUpload from '../OffenderUpload/OffenderUpload'
import AddPrisoners from './AddPrisoners'
import AppointmentDetails from '../../AppointmentDetails/AppointmentDetails'
import ScrollToTop from '../../Components/ScrollToTop'
import { DATE_ONLY_FORMAT_SPEC } from '../../dateHelpers'

class AddPrisonerContainer extends Component {
  constructor(props) {
    super(props)
    this.state = { complete: false }
  }

  componentWillMount() {
    const { appointmentDetails, history } = this.props
    if (Object.keys(appointmentDetails).length === 0) {
      history.push(routePaths.bulkAppointments)
    }
  }

  componentDidMount() {
    const { setLoadedDispatch, resetErrorDispatch } = this.props
    setLoadedDispatch(true)
    resetErrorDispatch()
  }

  onBulkAppointmentsCreated({ appointments }) {
    const { dispatchBulkAppointmentsComplete, appointmentDetails } = this.props
    this.raiseEvents({ appointments })

    this.setState({
      complete: true,
      appointmentsCreated: appointments.length,
      lastAppointmentDetails: appointmentDetails,
    })

    dispatchBulkAppointmentsComplete()
  }

  onCancel(event) {
    const { raiseAnalyticsEvent, notmEndpointUrl } = this.props
    event.preventDefault()
    raiseAnalyticsEvent(RecordAbandonment())
    window.location = notmEndpointUrl
  }

  raiseEvents({ appointments }) {
    const { raiseAnalyticsEvent, agencyId, appointmentDetails } = this.props

    raiseAnalyticsEvent(NumberOfAppointmentsEvent({ total: appointments.length, agencyId }))
    raiseAnalyticsEvent(
      AppointmentTypeUsed({
        total: appointments.length,
        appointmentType: appointmentDetails.appointmentType,
      })
    )
    raiseAnalyticsEvent(
      RecordWhenTheStartTimesHaveBeenAmended({
        appointmentsDefaults: appointmentDetails,
        appointments,
      })
    )

    if (appointmentDetails.recurring) {
      const { repeats, times } = appointmentDetails
      RecordRecurringAppointments({
        repeatPeriod: repeats,
        count: times,
      })
    }
  }

  render() {
    const {
      appointmentDetails,
      now,
      resetErrorDispatch,
      handleError,
      history,
      dispatchAppointmentPrisoners,
      prisoners,
    } = this.props

    const { complete, appointmentsCreated, lastAppointmentDetails } = this.state

    return (
      <Page title="Add prisoners" applicationTitle="Whereabouts" alwaysRender>
        {complete && (
          <ScrollToTop always>
            {lastAppointmentDetails.recurring ? (
              <H3> Appointments created </H3>
            ) : (
              <H3> {appointmentsCreated} appointments created </H3>
            )}
            <Divider />
            <AppointmentDetails {...lastAppointmentDetails} />
            <Divider />
            <ButtonContainer>
              <Button onClick={() => history.push(routePaths.bulkAppointments)}>Add another appointment</Button>
              <Button buttonColour={GREY_3} buttonTextColour={BLACK} onClick={e => this.onCancel(e)}>
                Back to home page
              </Button>
            </ButtonContainer>
          </ScrollToTop>
        )}
        {!complete && (
          <React.Fragment>
            <p> Upload the prison numbers for all prisoners attending the below appointment. </p>
            <Container>
              <Divider />
              <AppointmentDetails {...appointmentDetails} />
              <Divider />
              <OffenderUpload
                showCancelButton={prisoners.length === 0}
                onCancel={event => this.onCancel(event)}
                onError={error => handleError(error)}
                onSuccess={data => {
                  resetErrorDispatch()
                  dispatchAppointmentPrisoners(data)
                }}
              />
              <Divider />
              <AddPrisoners
                onError={error => handleError(error)}
                resetErrors={resetErrorDispatch}
                onCancel={event => this.onCancel(event)}
                onSuccess={appointments => this.onBulkAppointmentsCreated({ appointments })}
                appointment={appointmentDetails}
                offenders={prisoners}
                now={now}
                date={appointmentDetails.date && appointmentDetails.date.format(DATE_ONLY_FORMAT_SPEC)}
                startTime={appointmentDetails.startTime}
                dispatchAppointmentPrisoners={dispatchAppointmentPrisoners}
              />
            </Container>
          </React.Fragment>
        )}
      </Page>
    )
  }
}
AddPrisonerContainer.propTypes = {
  resetErrorDispatch: PropTypes.func.isRequired,
  agencyId: PropTypes.string.isRequired,
  handleError: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  notmEndpointUrl: PropTypes.string.isRequired,
  now: PropTypes.instanceOf(moment),
  appointmentDetails: appointmentType.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
  dispatchAppointmentPrisoners: PropTypes.func.isRequired,
  dispatchBulkAppointmentsComplete: PropTypes.func.isRequired,
  prisoners: PropTypes.arrayOf(PropTypes.object),
}

AddPrisonerContainer.defaultProps = {
  now: moment(),
  prisoners: [],
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  notmEndpointUrl: state.app.config.notmEndpointUrl,
  appointmentDetails: state.bulkAppointments.appointmentDetails,
  prisoners: state.bulkAppointments.prisoners,
})
const mapDispatchToProps = dispatch => ({
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
  dispatchAppointmentPrisoners: prisoners => dispatch(setAppointmentPrisoners(prisoners)),
  dispatchBulkAppointmentsComplete: () => dispatch(setBulkAppointmentsComplete()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPrisonerContainer)
