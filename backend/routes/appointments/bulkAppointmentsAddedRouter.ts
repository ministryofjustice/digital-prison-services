import express from 'express'
import { bulkAppointmentsAddedFactory } from '../../controllers/appointments/bulkAppointmentsAdded'

const router = express.Router()

const controller = () => {
  const { index } = bulkAppointmentsAddedFactory()

  router.get('/', index)

  return router
}

// @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
export default (dependencies) => controller(dependencies)
