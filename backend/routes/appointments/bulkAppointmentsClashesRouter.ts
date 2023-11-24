import express from 'express'
import { bulkAppointmentsClashesFactory } from '../../controllers/appointments/bulkAppointmentsClashes'

const router = express.Router()

const controller = ({ systemOauthClient, prisonApi }) => {
  const { index, post } = bulkAppointmentsClashesFactory(systemOauthClient, prisonApi)

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
