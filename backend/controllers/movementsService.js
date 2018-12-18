const moment = require('moment')

const movementsServiceFactory = (elite2Api, systemOauthClient) => {
  const getAssessmentMap = async (context, offenderNumbers) => {
    const assessments = (await elite2Api.getAssessments(context, { code: 'CATEGORY', offenderNumbers })) || []

    return assessments.reduce((map, current) => {
      if (map.has(current.offenderNo) === false) {
        map.set(current.offenderNo, current)
      }
      return map
    }, new Map())
  }

  const getActiveAlerts = async offenderNumbers => {
    const systemContext = await systemOauthClient.getClientCredentialsTokens()
    const alerts = await elite2Api.getAlertsSystem(systemContext, offenderNumbers)
    return alerts && alerts.filter(alert => !alert.expired)
  }

  const extractOffenderNumbers = movements => movements.map(m => m.offenderNo)

  const alertCodesForOffenderNo = (alerts, offenderNo) =>
    alerts.filter(alert => alert.offenderNo === offenderNo).map(alert => alert.alertCode)

  const addAlerts = (movements, alerts) =>
    alerts
      ? movements.map(movement => ({
          ...movement,
          alerts: alertCodesForOffenderNo(alerts, movement.offenderNo),
        }))
      : movements

  const categoryFromAssessment = assessment => (assessment ? { category: assessment.classificationCode } : {})

  const addCategory = (movements, assessmentMap) =>
    assessmentMap
      ? movements.map(movement => ({
          ...movement,
          ...categoryFromAssessment(assessmentMap.get(movement.offenderNo)),
        }))
      : movements

  const decorateMovements = async (context, movements) => {
    if (!movements || movements.length === 0) return []
    const offenderNumbers = extractOffenderNumbers(movements)
    const [alerts, assessmentMap] = await Promise.all([
      getActiveAlerts(offenderNumbers),
      getAssessmentMap(context, offenderNumbers),
    ])
    const movementsWithAlerts = addAlerts(movements, alerts)
    return addCategory(movementsWithAlerts, assessmentMap)
  }

  const isoDateToday = () => moment().format('YYYY-MM-DD')

  const getMovementsIn = async (context, agencyId) => {
    const movements = await elite2Api.getMovementsIn(context, agencyId, isoDateToday())
    return decorateMovements(context, movements)
  }

  const getMovementsOut = async (context, agencyId) => {
    const movements = await elite2Api.getMovementsOut(context, agencyId, isoDateToday())
    return decorateMovements(context, movements)
  }

  return {
    getMovementsIn,
    getMovementsOut,
  }
}

module.exports = {
  movementsServiceFactory,
}
