// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addAppoint... Remove this comment to see the full error message
const { addAppointmentFactory } = require('../../controllers/appointments/addAppointment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'appointmen... Remove this comment to see the full error message
const { appointmentsServiceFactory } = require('../../services/appointmentsService')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'existingEv... Remove this comment to see the full error message
const existingEventsServiceFactory = require('../../services/existingEventsService')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router({ mergeParams: true })

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
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

module.exports = (dependencies) => controller(dependencies)
