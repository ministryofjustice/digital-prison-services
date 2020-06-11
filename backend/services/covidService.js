const { putLastNameFirst } = require('../utils')

module.exports = {
  alerts: {
    protectiveIsolationUnit: 'UPIU',
    reverseCohortingUnit: 'URCU',
    shieldingUnit: 'USU',
    refusingToShield: 'URS',
  },

  covidServiceFactory: elite2Api => ({
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

      const alerts = await elite2Api.getAlerts(context, {
        agencyId: caseLoadId,
        offenderNumbers: inmates.map(inmate => inmate.offenderNo),
      })

      const inmateFor = offenderNo => inmates.find(inmate => inmate.offenderNo === offenderNo)

      return alerts
        .filter(({ alertCode }) => alertCode === code)
        .map(alert => [alert, inmateFor(alert.offenderNo)])
        .map(([alert, inmate]) => ({
          bookingId: inmate.bookingId,
          offenderNo: inmate.offenderNo,
          name: putLastNameFirst(inmate.firstName, inmate.lastName),
          assignedLivingUnitDesc: inmate.assignedLivingUnitDesc,
          alertCreated: alert.dateCreated,
        }))
    },
  }),
}
