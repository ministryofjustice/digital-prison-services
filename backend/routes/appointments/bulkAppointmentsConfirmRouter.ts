import express from 'express'
import { bulkAppointmentsConfirmFactory } from '../../controllers/appointments/bulkAppointmentsConfirm'

const router = express.Router()

const controller = ({ prisonApi, logError }) => {
  const { index, post } = bulkAppointmentsConfirmFactory(prisonApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
