import express from 'express'
import { bulkAppointmentsClashesFactory } from '../../controllers/appointments/bulkAppointmentsClashes'

const router = express.Router()

const controller = ({ prisonApi, logError }) => {
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
  const { index, post } = bulkAppointmentsClashesFactory(prisonApi, logError)

  router.get('/', index)
  router.post('/', post)

  return router
}

export default (dependencies) => controller(dependencies)
