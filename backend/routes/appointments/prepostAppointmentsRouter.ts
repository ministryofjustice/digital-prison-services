import express from 'express'
import prepostAppointments from '../../controllers/appointments/prepostAppoinments'
import { appointmentsServiceFactory } from '../../services/appointmentsService'
import existingEventsServiceFactory from '../../services/existingEventsService'

const router = express.Router({ mergeParams: true })

const controller = ({
  prisonApi,
  logError,
  hmppsManageUsersApi,
  whereaboutsApi,
  notifyClient,
  raiseAnalyticsEvent,
}) => {
  const appointmentsService = appointmentsServiceFactory(prisonApi)
  const existingEventsService = existingEventsServiceFactory(prisonApi)
  const { index, post, cancel } = prepostAppointments.prepostAppointmentsFactory({
    prisonApi,
    hmppsManageUsersApi,
    whereaboutsApi,
    notifyClient,
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: any; oauthApi: any;... Remove this comment to see the full error message
    logError,
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
