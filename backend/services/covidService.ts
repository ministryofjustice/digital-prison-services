import moment from 'moment'
import { putLastNameFirst } from '../utils'

export const alerts = {
  protectiveIsolationUnit: 'UPIU',
  reverseCohortingUnit: 'URCU',
  shieldingUnit: 'USU',
  refusingToShield: 'URS',
}

function hasCovidAlertByOffenderNo(alertsByOffenderNumber) {
  return (offenderNo) => {
    const alertsForOffender = alertsByOffenderNumber[offenderNo] || []
    return alertsForOffender
      .filter(({ expired }) => !expired)
      .some(({ alertCode }) => Object.values(alerts).includes(alertCode))
  }
}

export const covidServiceFactory = (systemOauthClient, prisonApi, now = () => moment()) => {
  async function getRecentMovements(context, caseLoadId) {
    const fourteenDaysAgo = now().startOf('day').subtract(14, 'days').format('YYYY-MM-DDTHH:mm:ss')

    return prisonApi.getMovementsInBetween(context, caseLoadId, { fromDateTime: fourteenDaysAgo })
  }

  async function getAlertsByOffenderNumber(context, caseLoadId, offenderNumbers) {
    const offenderAlerts = await prisonApi.getAlerts(context, {
      agencyId: caseLoadId,
      offenderNumbers,
    })

    return offenderAlerts.reduce((result, alert) => {
      const bucket = result[alert.offenderNo] || []
      const newBucket = [...bucket, alert]
      return { ...result, [alert.offenderNo]: newBucket }
    }, {})
  }

  return {
    async getCount(req, res, alert) {
      const { caseLoadId } = res.locals.user.activeCaseLoad

      const systemContext = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)
      const context = { ...systemContext, requestHeaders: { 'page-offset': 0, 'page-limit': 1 } }

      await prisonApi.getInmates(context, caseLoadId, alert ? { alerts: alert } : {})

      return context.responseHeaders['total-records']
    },

    async getAlertList(req, res, code) {
      const { caseLoadId } = res.locals.user.activeCaseLoad

      const systemContext = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)
      const requestHeaders = { 'page-offset': 0, 'page-limit': 3000 }
      const inmates = await prisonApi.getInmates(
        { ...systemContext, requestHeaders },
        caseLoadId,
        code ? { alerts: code } : {}
      )

      const offenderAlerts = await prisonApi.getAlerts(
        { ...res.locals, requestHeaders },
        {
          agencyId: caseLoadId,
          offenderNumbers: inmates.map((inmate) => inmate.offenderNo),
        }
      )

      const inmateFor = (offenderNo) => inmates.find((inmate) => inmate.offenderNo === offenderNo)

      return offenderAlerts
        .filter(({ alertCode }) => alertCode === code)
        .filter(({ expired }) => !expired)
        .map((alert) => [alert, inmateFor(alert.offenderNo)])
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
      const recentMovements = await getRecentMovements(context, caseLoadId)
      const alertsByOffenderNumber = await getAlertsByOffenderNumber(
        context,
        caseLoadId,
        recentMovements.map((inmate) => inmate.offenderNo)
      )

      const hasCovidAlert = hasCovidAlertByOffenderNo(alertsByOffenderNumber)

      return recentMovements
        .filter(({ offenderNo }) => !hasCovidAlert(offenderNo))
        .map((movement) => ({
          bookingId: movement.bookingId,
          offenderNo: movement.offenderNo,
          name: putLastNameFirst(movement.firstName, movement.lastName),
          assignedLivingUnitDesc: movement.location,
          arrivalDate: movement.movementDateTime,
        }))
    },
  }
}
export default {
  alerts,
  covidServiceFactory,
}
