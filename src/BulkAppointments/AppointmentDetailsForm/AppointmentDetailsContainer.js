import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'

import Page from '../../Components/Page'
import { setAppointmentDetails } from '../../redux/actions'
import WithDataSource from '../../WithDataSource/WithDataSource'
import { RecordAbandonment } from '../BulkAppointmentsGaEvents'
import AppointmentDetailsForm from './AppointmentDetailsForm'

import { appointmentType } from '../../types'
import routePaths from '../../routePaths'

const AppointmentDetailsFormContainer = ({
  appointmentDetails,
  notmEndpointUrl,
  raiseAnalyticsEvent,
  agencyId,
  now,
  dispatchAppointmentDetails,
  history,
}) => (
  <WithDataSource
    request={{ url: '/api/bulk-appointments/view-model', params: { agencyId } }}
    render={({ data, error }) => (
      <Page title="Add bulk appointments" alwaysRender>
        <AppointmentDetailsForm
          initialValues={appointmentDetails}
          now={now}
          appointmentTypes={data.appointmentTypes}
          locationTypes={data.locationTypes}
          error={error}
          onCancel={event => {
            event.preventDefault()
            raiseAnalyticsEvent(RecordAbandonment())
            window.location = notmEndpointUrl
          }}
          onSuccess={values => {
            dispatchAppointmentDetails(values)
            history.push(routePaths.bulkAppointmentsAddPrisoners)
          }}
        />
      </Page>
    )}
  />
)

AppointmentDetailsFormContainer.propTypes = {
  agencyId: PropTypes.string.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  notmEndpointUrl: PropTypes.string.isRequired,
  now: PropTypes.instanceOf(moment),
  appointmentDetails: appointmentType,
  dispatchAppointmentDetails: PropTypes.func.isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
}

AppointmentDetailsFormContainer.defaultProps = {
  now: moment(),
  appointmentDetails: {},
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  notmEndpointUrl: state.app.config.notmEndpointUrl,
  appointmentDetails: state.bulkAppointments.appointmentDetails,
})

const mapDispatchToProps = dispatch => ({
  dispatchAppointmentDetails: details => dispatch(setAppointmentDetails(details)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppointmentDetailsFormContainer)
