import { alerts } from '../../services/covidService'

export default ({ covidService }) => {
  const loadStats = async (req, res) => {
    const [
      prisonPopulation,
      reverseCohortingUnit,
      protectiveIsolationUnit,
      shieldingUnit,
      refusingToShield,
      notInUnit,
    ] = await Promise.all([
      covidService.getCount(req, res),
      covidService.getCount(req, res, alerts.reverseCohortingUnit),
      covidService.getCount(req, res, alerts.protectiveIsolationUnit),
      covidService.getCount(req, res, alerts.shieldingUnit),
      covidService.getCount(req, res, alerts.refusingToShield),
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
    const dashboardStats = await loadStats(req, res)
    return res.render('covid/dashboard.njk', { title: 'Current breakdown of COVID units', dashboardStats })
  }
}
