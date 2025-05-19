import express from 'express'
import { addAppointmentFactory } from '../../controllers/appointments/addAppointment'
import { appointmentsServiceFactory } from '../../services/appointmentsService'
import existingEventsServiceFactory from '../../services/existingEventsService'

const router = express.Router({ mergeParams: true })

const controller = ({
  systemOauthClient,
  prisonApi,
  locationsInsidePrisonApi,
  whereaboutsApi,
  nomisMapping,
  logError,
}) => {
  const { index, post } = addAppointmentFactory(
    appointmentsServiceFactory(prisonApi, locationsInsidePrisonApi, nomisMapping),
    systemOauthClient,
    existingEventsServiceFactory(systemOauthClient.getClientCredentialsTokens, prisonApi),
    prisonApi,
    whereaboutsApi,
    logError
  )

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
