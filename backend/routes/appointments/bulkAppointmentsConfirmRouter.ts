import express from 'express'
import { bulkAppointmentsConfirmFactory } from '../../controllers/appointments/bulkAppointmentsConfirm'

const router = express.Router()

const controller = ({ systemOauthClient, prisonApi }) => {
  const { index, post } = bulkAppointmentsConfirmFactory(systemOauthClient, prisonApi)

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
