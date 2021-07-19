// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
const confirmAppointment = require('../../controllers/appointments/confirmAppointment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'appointmen... Remove this comment to see the full error message
const { appointmentsServiceFactory } = require('../../services/appointmentsService')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router({ mergeParams: true })

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
const controller = ({ prisonApi, logError }) => {
  const appointmentsService = appointmentsServiceFactory(prisonApi)
  const { index } = confirmAppointment.confirmAppointmentFactory({ prisonApi, appointmentsService, logError })

  router.get('/', index)

  return router
}

module.exports = (dependencies) => controller(dependencies)
