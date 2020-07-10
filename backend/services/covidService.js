const moment = require('moment')
const { putLastNameFirst } = require('../utils')

const alerts = {
  protectiveIsolationUnit: 'UPIU',
  reverseCohortingUnit: 'URCU',
  shieldingUnit: 'USU',
  refusingToShield: 'URS',
}

module.exports = {
  alerts,

  covidServiceFactory: (elite2Api, now = () => moment()) => ({
    async getCount(res, alert) {
      const { caseLoadId } = res.locals.user.activeCaseLoad

      const context = { ...res.locals, requestHeaders: { 'page-offset': 0, 'page-limit': 1 } }

      await elite2Api.getInmates(context, caseLoadId, alert ? { alerts: alert } : {})

      return context.responseHeaders['total-records']
    },

    async getAlertList(res, code) {
      const { caseLoadId } = res.locals.user.activeCaseLoad

      const context = { ...res.locals, requestHeaders: { 'page-offset': 0, 'page-limit': 3000 } }

      const inmates = await elite2Api.getInmates(context, caseLoadId, code ? { alerts: code } : {})

      const offenderAlerts = await elite2Api.getAlerts(context, {
        agencyId: caseLoadId,
        offenderNumbers: inmates.map(inmate => inmate.offenderNo),
      })

      const inmateFor = offenderNo => inmates.find(inmate => inmate.offenderNo === offenderNo)

      return offenderAlerts
        .filter(({ alertCode }) => alertCode === code)
        .filter(({ expired }) => !expired)
        .map(alert => [alert, inmateFor(alert.offenderNo)])
        .map(([alert, inmate]) => ({
          bookingId: inmate.bookingId,
          offenderNo: inmate.offenderNo,
          name: putLastNameFirst(inmate.firstName, inmate.lastName),
          assignedLivingUnitDesc: inmate.assignedLivingUnitDesc,
          alertCreated: alert.dateCreated,
        }))
    },

    async getUnassignedNewEntrants(res) {
      const { caseLoadId } = res.locals.user.activeCaseLoad

      const context = { ...res.locals, requestHeaders: { 'page-offset': 0, 'page-limit': 3000 } }

      const fourteenDaysAgo = now()
        .startOf('day')
        .subtract(14, 'days')
        .format('YYYY-MM-DDTHH:mm:ss')
      const movements = await elite2Api.getMovementsInBetween(context, caseLoadId, { fromDateTime: fourteenDaysAgo })

      const offenderAlerts = await elite2Api.getAlerts(context, {
        agencyId: caseLoadId,
        offenderNumbers: movements.map(inmate => inmate.offenderNo),
      })

      const alertsByOffenderNumber = offenderAlerts.reduce((result, alert) => {
        const bucket = result[alert.offenderNo] || []
        const newBucket = [...bucket, alert]
        return { ...result, [alert.offenderNo]: newBucket }
      }, {})

      const isAssigned = offenderNo => {
        const alertsForOffender = alertsByOffenderNumber[offenderNo] || []
        return alertsForOffender
          .filter(({ expired }) => !expired)
          .some(({ alertCode }) => Object.values(alerts).includes(alertCode))
      }

      return movements.filter(({ offenderNo }) => !isAssigned(offenderNo)).map(movement => ({
        bookingId: movement.bookingId,
        offenderNo: movement.offenderNo,
        name: putLastNameFirst(movement.firstName, movement.lastName),
        assignedLivingUnitDesc: movement.location,
        arrivalDate: movement.movementDateTime,
      }))
    },
  }),
}
