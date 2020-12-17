const moment = require('moment')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const { capitalize } = require('../../utils')

const zeroIfNotDefined = number => number || 0

const getTotals = (array, figure) =>
  array.reduce((accumulator, block) => accumulator + zeroIfNotDefined(block[figure]), 0)

module.exports = ({ prisonApi, logError }) => async (req, res) => {
  try {
    const { caseLoadId, description: caseLoadDescription } = res.locals.user.activeCaseLoad
    const [assignedResponse, unassignedResponse, movementsResponse, enroute, caseLoadLocations] = await Promise.all([
      prisonApi.getEstablishmentRollBlocksCount(res.locals, caseLoadId, false),
      prisonApi.getEstablishmentRollBlocksCount(res.locals, caseLoadId, true),
      prisonApi.getEstablishmentRollMovementsCount(res.locals, caseLoadId),
      prisonApi.getEstablishmentRollEnrouteCount(res.locals, caseLoadId),
      prisonApi.getLocationsForAgency(res.locals, caseLoadId),
    ])

    const cellSwapLocation = caseLoadLocations.find(location => location.description === 'CSWAP')

    const cellSwapDetails = cellSwapLocation
      ? await prisonApi.getAttributesForLocation(res.locals, cellSwapLocation.locationId)
      : {}

    const unassignedIn = getTotals(unassignedResponse, 'currentlyInCell')
    const currentRoll = getTotals(assignedResponse, 'currentlyInCell') + unassignedIn

    const todayStats = {
      unlockRoll: currentRoll - movementsResponse.in + movementsResponse.out,
      inToday: movementsResponse.in,
      outToday: movementsResponse.out,
      currentRoll,
      unassignedIn,
      enroute,
      noCellAllocated: zeroIfNotDefined(cellSwapDetails?.noOfOccupants),
    }

    const blocks = assignedResponse.map(row => {
      const { livingUnitId, currentlyOut } = row

      const currentlyOutHTML = `<a class="govuk-link" href="/establishment-roll/${livingUnitId}/currently-out">${currentlyOut}</a>`

      return [
        { text: capitalize(row.livingUnitDesc) },
        { text: zeroIfNotDefined(row.bedsInUse) },
        { text: zeroIfNotDefined(row.currentlyInCell) },
        {
          text: zeroIfNotDefined(row.currentlyOut),
          html: currentlyOut > 0 && currentlyOutHTML,
        },
        { text: zeroIfNotDefined(row.operationalCapacity) },
        { text: zeroIfNotDefined(row.netVacancies) },
        { text: zeroIfNotDefined(row.outOfOrder) },
      ]
    })

    const totalCurrentlyOut = getTotals(assignedResponse, 'currentlyOut')
    const totalCurrentlyOutHTML = `<a class="govuk-link" href="/establishment-roll/total-currently-out">${totalCurrentlyOut}</a>`

    const rows = [
      ...blocks,
      [
        { text: caseLoadDescription },
        { text: getTotals(assignedResponse, 'bedsInUse') },
        { text: getTotals(assignedResponse, 'currentlyInCell') },
        {
          text: totalCurrentlyOut,
          html: totalCurrentlyOut > 0 && totalCurrentlyOutHTML,
        },
        { text: getTotals(assignedResponse, 'operationalCapacity') },
        { text: getTotals(assignedResponse, 'netVacancies') },
        { text: getTotals(assignedResponse, 'outOfOrder') },
      ],
    ]

    return res.render('establishmentRoll/dashboard.njk', {
      date: moment().format('dddd D MMMM YYYY'),
      dpsUrl,
      todayStats,
      rows,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, 'Failed to load estalishment roll count page')

    return res.render('error.njk', {
      url: '/establishment-roll',
      homeUrl: dpsUrl,
    })
  }
}
