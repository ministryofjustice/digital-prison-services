import express from 'express'
import confirmAppointment from '../../controllers/appointments/confirmAppointment'
import { appointmentsServiceFactory } from '../../services/appointmentsService'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, locationsInsidePrisonApi, systemOauthClient, nomisMapping, logError }) => {
  const appointmentsService = appointmentsServiceFactory(prisonApi, locationsInsidePrisonApi, nomisMapping)
  const { index } = confirmAppointment.confirmAppointmentFactory({
    prisonApi,
    appointmentsService,
    systemOauthClient,
    logError,
  })

  router.get('/', index)

  return router
}

export default (dependencies) => controller(dependencies)
