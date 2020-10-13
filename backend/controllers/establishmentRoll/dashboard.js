const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const { capitalize } = require('../../utils')

const zeroIfNotDefined = number => number || 0

const getTotals = (array, figure) =>
  array.reduce((accumulator, block) => accumulator + zeroIfNotDefined(block[figure]), 0)

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  try {
    const agencyId = res.locals.user.activeCaseLoad.caseLoadId
    const [assignedResponse, unassignedResponse, movementsResponse, enroute] = await Promise.all([
      elite2Api.getEstablishmentRollBlocksCount(res.locals, agencyId, false),
      elite2Api.getEstablishmentRollBlocksCount(res.locals, agencyId, true),
      elite2Api.getEstablishmentRollMovementsCount(res.locals, agencyId),
      elite2Api.getEstablishmentRollEnrouteCount(res.locals, agencyId),
    ])

    const unassignedIn = getTotals(unassignedResponse, 'currentlyInCell')
    const currentRoll = getTotals(assignedResponse, 'currentlyInCell') + unassignedIn

    const todayStats = {
      unlockRoll: currentRoll - movementsResponse.in + movementsResponse.out,
      inToday: movementsResponse.in,
      outToday: movementsResponse.out,
      currentRoll,
      unassignedIn,
      enroute,
    }
    const blocks = assignedResponse.map(block => ({
      name: capitalize(block.livingUnitDesc),
      livingUnitId: block.livingUnitId,
      stats: {
        bedsInUse: zeroIfNotDefined(block.bedsInUse),
        inCell: zeroIfNotDefined(block.currentlyInCell),
        out: zeroIfNotDefined(block.currentlyOut),
        operationalCapacity: zeroIfNotDefined(block.operationalCapacity),
        netVacancies: zeroIfNotDefined(block.netVacancies),
        outOfOrder: zeroIfNotDefined(block.outOfOrder),
      },
    }))

    const totalsStats = {
      roll: getTotals(assignedResponse, 'bedsInUse'),
      inCell: getTotals(assignedResponse, 'currentlyInCell'),
      out: getTotals(assignedResponse, 'currentlyOut'),
      operationalCapacity: getTotals(assignedResponse, 'operationalCapacity'),
      vacancies: getTotals(assignedResponse, 'netVacancies'),
      outOfOrder: getTotals(assignedResponse, 'outOfOrder'),
    }

    return res.render('establishmentRoll/dashboard.njk', {
      todayStats,
      blocks,
      totalsStats,
      notmUrl: dpsUrl,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, 'Failed to load estalishment roll count page')

    return res.render('error.njk', {
      url: '/establishment-roll',
      homeUrl: dpsUrl,
    })
  }
}
