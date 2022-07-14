import express from 'express'
import { bulkAppointmentsClashesFactory } from '../../controllers/appointments/bulkAppointmentsClashes'

const router = express.Router()

const controller = ({ prisonApi, logError }) => {
  const { index, post } = bulkAppointmentsClashesFactory(prisonApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
