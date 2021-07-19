// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'alerts'.
const { alerts } = require('../../services/covidService')

module.exports = ({ covidService }) => {
  const loadStats = async (res) => {
    const [
      prisonPopulation,
      reverseCohortingUnit,
      protectiveIsolationUnit,
      shieldingUnit,
      refusingToShield,
      notInUnit,
    ] = await Promise.all([
      covidService.getCount(res),
      covidService.getCount(res, alerts.reverseCohortingUnit),
      covidService.getCount(res, alerts.protectiveIsolationUnit),
      covidService.getCount(res, alerts.shieldingUnit),
      covidService.getCount(res, alerts.refusingToShield),
      covidService.getUnassignedNewEntrants(res),
    ])

    return {
      prisonPopulation,
      reverseCohortingUnit,
      protectiveIsolationUnit,
      shieldingUnit,
      refusingToShield,
      notInUnitCount: notInUnit.length,
    }
  }

  return async (req, res) => {
    const dashboardStats = await loadStats(res)
    return res.render('covid/dashboard.njk', { title: 'Current breakdown of COVID units', dashboardStats })
  }
}
