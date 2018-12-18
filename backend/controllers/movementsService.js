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

  const getMovementsIn = (context, agencyId) => {
    const isoDateToday = moment().format('YYYY-MM-DD')
    return elite2Api.getMovementsIn(context, agencyId, isoDateToday)
  }

  const getMovementsOut = async (context, agencyId) => {
    const isoDateToday = moment().format('YYYY-MM-DD')
    const offenders = await elite2Api.getMovementsOut(context, agencyId, isoDateToday)

    if (!offenders || offenders.length === 0) return []

    const offenderNumbers = offenders.map(offender => offender.offenderNo)
    const alerts = await getActiveAlerts(offenderNumbers)
    const assessmentMap = await getAssessmentMap(context, offenderNumbers)

    return offenders.map(offender => {
      const extraProperties = {}

      if (assessmentMap.has(offender.offenderNo))
        extraProperties.category = assessmentMap.get(offender.offenderNo).classificationCode

      if (alerts)
        extraProperties.alerts = alerts.filter(o => o.offenderNo === offender.offenderNo).map(alert => alert.alertCode)

      return {
        ...offender,
        ...extraProperties,
      }
    })
  }

  return {
    getMovementsIn,
    getMovementsOut,
  }
}

module.exports = {
  movementsServiceFactory,
}
