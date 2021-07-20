// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'toMap'.
const { toMap } = require('../utils')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'movementsS... Remove this comment to see the full error message
const movementsServiceFactory = (prisonApi, systemOauthClient) => {
  const getAssessmentMap = async (context, offenderNumbers) => {
    const assessments = (await prisonApi.getAssessments(context, { code: 'CATEGORY', offenderNumbers })) || []
    return toMap('offenderNo', assessments)
  }

  const getIepMap = async (context, bookingIds) => {
    const iepData = (await prisonApi.getIepSummary(context, bookingIds)) || []
    return toMap('bookingId', iepData)
  }

  const getRecentMovementsMap = async (systemContext, offenderNumbers) => {
    const recentMovements = (await prisonApi.getRecentMovements(systemContext, offenderNumbers, [])) || []
    return toMap('offenderNo', recentMovements)
  }

  const getActiveAlerts = async (systemContext, offenderNumbers) => {
    const alerts = await prisonApi.getAlertsSystem(systemContext, offenderNumbers)
    return alerts && alerts.filter((alert) => !alert.expired)
  }

  const extractOffenderNumbers = (obj) => obj.map((o) => o.offenderNo)
  const extractBookingIds = (obj) => obj.map((o) => o.bookingId)

  const alertCodesForOffenderNo = (alerts, offenderNo) =>
    alerts.filter((alert) => alert.offenderNo === offenderNo).map((alert) => alert.alertCode)

  const addAlerts = (objects, alerts) =>
    alerts
      ? objects.map((obj) => ({
          ...obj,
          alerts: alertCodesForOffenderNo(alerts, obj.offenderNo),
        }))
      : objects

  const categoryFromAssessment = (assessment) => (assessment ? { category: assessment.classificationCode } : {})

  const addCategory = (objects, assessmentMap) =>
    assessmentMap
      ? objects.map((obj) => ({
          ...obj,
          ...categoryFromAssessment(assessmentMap.get(obj.offenderNo)),
        }))
      : objects

  const addMovements = (objects, recentMovementsMap) =>
    objects.map((obj) => {
      const m = recentMovementsMap.get(obj.offenderNo)
      if (!m) {
        return obj
      }
      const { toAgency, toAgencyDescription, fromAgency, fromAgencyDescription, commentText, fromCity, toCity } = m
      return {
        ...obj,
        toAgency,
        toAgencyDescription,
        fromAgency,
        fromAgencyDescription,
        commentText,
        fromCity,
        toCity,
      }
    })

  const addIepSummaries = (objects, iepMap) =>
    objects.map((obj) => {
      const iepSummary = iepMap.get(obj.bookingId)
      if (!iepSummary) return obj
      return {
        ...obj,
        iepLevel: iepSummary.iepLevel,
      }
    })

  const addAlertsAndCategory = async (context, obj) => {
    if (!obj || obj.length === 0) return []
    const offenderNumbers = extractOffenderNumbers(obj)
    const systemContext = await systemOauthClient.getClientCredentialsTokens()
    const [alerts, assessmentMap] = await Promise.all([
      getActiveAlerts(systemContext, offenderNumbers),
      getAssessmentMap(context, offenderNumbers),
    ])
    const movementsWithAlerts = addAlerts(obj, alerts)
    return addCategory(movementsWithAlerts, assessmentMap)
  }

  const isoDateToday = () => moment().format('YYYY-MM-DD')

  const getMovementsIn = async (context, agencyId) => {
    const movements = await prisonApi.getMovementsIn(context, agencyId, isoDateToday())

    if (!movements || movements.length === 0) return []
    const offenderNumbers = extractOffenderNumbers(movements)
    const bookingIds = extractBookingIds(movements)

    const systemContext = await systemOauthClient.getClientCredentialsTokens()
    const [alerts, iepMap, assessmentMap] = await Promise.all([
      getActiveAlerts(systemContext, offenderNumbers),
      getIepMap(context, bookingIds),
      getAssessmentMap(context, offenderNumbers),
    ])
    const movementsWithAlerts = addAlerts(movements, alerts)
    const withCategories = addCategory(movementsWithAlerts, assessmentMap)
    return addIepSummaries(withCategories, iepMap)
  }

  const getMovementsOut = async (context, agencyId) => {
    const movements = await prisonApi.getMovementsOut(context, agencyId, isoDateToday())
    return addAlertsAndCategory(context, movements)
  }

  const getOffendersInReception = async (context, agencyId) => {
    const offenders = await prisonApi.getOffendersInReception(context, agencyId)

    if (!offenders) return []

    const offenderNumbers = extractOffenderNumbers(offenders)
    const bookingIds = extractBookingIds(offenders)

    const systemContext = await systemOauthClient.getClientCredentialsTokens()

    const [alerts, iepMap, recentMovementsMap] = await Promise.all([
      getActiveAlerts(systemContext, offenderNumbers),
      getIepMap(context, bookingIds),
      getRecentMovementsMap(systemContext, offenderNumbers),
    ])

    const withMovements = addMovements(offenders, recentMovementsMap)
    const withAlerts = addAlerts(withMovements, alerts)
    return addIepSummaries(withAlerts, iepMap)
  }

  const addAlertsCategoryIepMovements = async (context, offenders) => {
    if (!offenders || offenders.length === 0) return []

    const offenderNumbers = extractOffenderNumbers(offenders)
    const bookingIds = extractBookingIds(offenders)

    const systemContext = await systemOauthClient.getClientCredentialsTokens()

    const [alerts, iepMap, assessmentMap, recentMovementsMap] = await Promise.all([
      getActiveAlerts(systemContext, offenderNumbers),
      getIepMap(context, bookingIds),
      getAssessmentMap(context, offenderNumbers),
      getRecentMovementsMap(systemContext, offenderNumbers),
    ])
    const withAlerts = addAlerts(offenders, alerts)
    const withCategories = addCategory(withAlerts, assessmentMap)
    const withIep = addIepSummaries(withCategories, iepMap)
    return addMovements(withIep, recentMovementsMap)
  }

  const getOffendersCurrentlyOutOfLivingUnit = async (context, livingUnitId) => {
    const offenders = await prisonApi.getOffendersCurrentlyOutOfLivingUnit(context, livingUnitId)
    const [currentlyOut, location] = await Promise.all([
      addAlertsCategoryIepMovements(context, offenders),
      prisonApi.getLocation(context, livingUnitId),
    ])

    return {
      location: location.userDescription || location.internalLocationCode || '',
      currentlyOut,
    }
  }

  const getOffendersCurrentlyOutOfAgency = async (context, agencyId) => {
    const offenders = await prisonApi.getOffendersCurrentlyOutOfAgency(context, agencyId)
    return addAlertsCategoryIepMovements(context, offenders)
  }

  const getOffendersEnRoute = async (context, agency) => {
    const offenders = await prisonApi.getOffendersEnRoute(context, agency)
    return addAlertsAndCategory(context, offenders)
  }

  return {
    getMovementsIn,
    getMovementsOut,
    getOffendersInReception,
    getOffendersCurrentlyOutOfLivingUnit,
    getOffendersCurrentlyOutOfAgency,
    getOffendersEnRoute,
  }
}

module.exports = {
  movementsServiceFactory,
}
