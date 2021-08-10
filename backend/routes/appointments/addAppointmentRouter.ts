import express from 'express'
import { addAppointmentFactory } from '../../controllers/appointments/addAppointment'
import { appointmentsServiceFactory } from '../../services/appointmentsService'
import existingEventsServiceFactory from '../../services/existingEventsService'

const router = express.Router({ mergeParams: true })

const controller = ({ prisonApi, whereaboutsApi, logError }) => {
  const { index, post } = addAppointmentFactory(
    appointmentsServiceFactory(prisonApi),
    existingEventsServiceFactory(prisonApi),
    prisonApi,
    whereaboutsApi,
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 5.
    logError
  )

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
