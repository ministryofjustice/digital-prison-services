const moment = require('moment')

const movementsServiceFactory = (elite2Api, oauthClientId) => {
  const getAssessmentMap = async (context, offenderNumbers) => {
    const assessments = (await elite2Api.getAssessments(context, { code: 'CATEGORY', offenderNumbers })) || []

    return assessments.reduce((map, current) => {
      if (map.has(current.offenderNo) === false) {
        map.set(current.offenderNo, current)
      }
      return map
    }, new Map())
  }

  const getAlerts = async offenderNumbers => {
    const systemContext = await oauthClientId.getClientCredentialsTokens()
    return elite2Api.getAlertsSystem(systemContext, offenderNumbers)
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
    const alerts = await getAlerts(offenderNumbers)
    const assessmentMap = await getAssessmentMap(context, offenderNumbers)

    return offenders.map(offender => {
      const extraProperties = {}

      if (assessmentMap.has(offender.offenderNo))
        extraProperties.category = assessmentMap.get(offender.offenderNo).classificationCode

      if (alerts) extraProperties.alerts = alerts.filter(o => o.offenderNo === offender.offenderNo)

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
