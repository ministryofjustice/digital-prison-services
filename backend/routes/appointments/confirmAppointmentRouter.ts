import express from 'express'
import confirmAppointment from '../../controllers/appointments/confirmAppointment'
import { appointmentsServiceFactory } from '../../services/appointmentsService'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, locationsInsidePrisonApi, logError }) => {
  const appointmentsService = appointmentsServiceFactory(prisonApi, locationsInsidePrisonApi)
  const { index } = confirmAppointment.confirmAppointmentFactory({ prisonApi, appointmentsService, logError })

  router.get('/', index)

  return router
}

export default (dependencies) => controller(dependencies)
