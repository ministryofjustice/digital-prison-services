import express from 'express'
import prepostAppointments from '../../controllers/appointments/prepostAppoinments'
import { appointmentsServiceFactory } from '../../services/appointmentsService'
import existingEventsServiceFactory from '../../services/existingEventsService'

const router = express.Router({ mergeParams: true })

const controller = ({
  systemOauthClient,
  prisonApi,
  hmppsManageUsersApi,
  whereaboutsApi,
  notifyClient,
  raiseAnalyticsEvent,
}) => {
  const appointmentsService = appointmentsServiceFactory(prisonApi)
  const existingEventsService = existingEventsServiceFactory(systemOauthClient.getClientCredentialsTokens, prisonApi)
  const { index, post, cancel } = prepostAppointments.prepostAppointmentsFactory({
    prisonApi,
    hmppsManageUsersApi,
    whereaboutsApi,
    notifyClient,
    appointmentsService,
    existingEventsService,
    raiseAnalyticsEvent,
  })

  router.get('/', index)
  router.post('/', post)
  router.get('/cancel', cancel)

  return router
}

export default (dependencies) => controller(dependencies)
