import express from 'express'
import { bulkAppointmentsInvalidNumbersFactory } from '../../controllers/appointments/bulkAppointmentsInvalidNumbers'

const router = express.Router()

const controller = () => {
  const { index } = bulkAppointmentsInvalidNumbersFactory()

  router.get('/', index)

  return router
}

// @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
export default (dependencies) => controller(dependencies)
