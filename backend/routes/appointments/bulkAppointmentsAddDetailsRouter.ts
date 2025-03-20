import express from 'express'
import { bulkAppointmentsAddDetailsFactory } from '../../controllers/appointments/bulkAppointmentsAddDetails'
import { appointmentsServiceFactory } from '../../services/appointmentsService'

const router = express.Router()

const controller = ({ prisonApi, locationsInsidePrisonApi, oauthApi, logError }) => {
  const { index, post } = bulkAppointmentsAddDetailsFactory(
    appointmentsServiceFactory(prisonApi, locationsInsidePrisonApi)
  )

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
