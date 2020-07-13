const { alerts } = require('../../services/covidService')

module.exports = ({ covidService, logError }) => {
  const loadStats = async res => {
    const [
      prisonPopulation,
      reverseCohortingUnit,
      protectiveIsolationUnit,
      shieldingUnit,
      refusingToShield,
    ] = await Promise.all([
      covidService.getCount(res),
      covidService.getCount(res, alerts.reverseCohortingUnit),
      covidService.getCount(res, alerts.protectiveIsolationUnit),
      covidService.getCount(res, alerts.shieldingUnit),
      covidService.getCount(res, alerts.refusingToShield),
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
      return res.render('covid/dashboard.njk', { title: 'Current breakdown of COVID units', dashboardStats })
    } catch (e) {
      logError(req.originalUrl, e, 'Failed to load dashboard stats')
      return res.render('error.njk', { url: '/current-covid-units' })
    }
  }
}
