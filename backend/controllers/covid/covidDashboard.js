module.exports = ({ elite2Api, logError }) => {
  const alerts = {
    protectiveIsolationUnit: 'UPIU',
    reverseCohortingUnit: 'URCU',
    shieldingUnit: 'USU',
    refusingToShield: 'URS',
  }

  const getCount = async (res, alert) => {
    const { caseLoadId } = res.locals.user.activeCaseLoad

    const context = { ...res.locals, requestHeaders: { 'page-offset': 0, 'page-limit': 1 } }

    await elite2Api.getInmates(context, caseLoadId, alert ? { alerts: alert } : {})

    return context.responseHeaders['total-records']
  }

  const loadStats = async res => {
    const [
      prisonPopulation,
      reverseCohortingUnit,
      protectiveIsolationUnit,
      shieldingUnit,
      refusingToShield,
    ] = await Promise.all([
      getCount(res),
      getCount(res, alerts.reverseCohortingUnit),
      getCount(res, alerts.protectiveIsolationUnit),
      getCount(res, alerts.shieldingUnit),
      getCount(res, alerts.refusingToShield),
    ])

    return {
      prisonPopulation,
      reverseCohortingUnit,
      protectiveIsolationUnit,
      shieldingUnit,
      refusingToShield,
    }
  }

  return async (req, res) => {
    try {
      const dashboardStats = await loadStats(res)
      return res.render('covid/dashboard.njk', { dashboardStats })
    } catch (e) {
      logError(req.originalUrl, e, 'Failed to load dashboard stats')
      return res.render('error.njk', { url: '/current-covid-units' })
    }
  }
}
