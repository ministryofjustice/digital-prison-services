const { capitalize } = require('../utils')

const safeNumber = number => Number(number || 0)

const getTotals = (array, figure) => array.reduce((accumulator, block) => accumulator + safeNumber(block[figure]), 0)

const getEstablishmentRollCountFactory = elite2Api => {
  const getEstablishmentRollCount = async (context, agencyId) => {
    const [assignedResponse, unassignedResponse, movementsResponse, enroute] = await Promise.all([
      elite2Api.getEstablishmentRollBlocksCount(context, agencyId, false),
      elite2Api.getEstablishmentRollBlocksCount(context, agencyId, true),
      elite2Api.getEstablishmentRollMovementsCount(context, agencyId),
      elite2Api.getEstablishmentRollEnrouteCount(context, agencyId),
    ])

    const unassignedIn = getTotals(unassignedResponse, 'currentlyInCell')
    const currentRoll = getTotals(assignedResponse, 'currentlyInCell') + unassignedIn

    const movements = {
      name: "Today's movements",
      numbers: [
        { name: 'Unlock roll', value: safeNumber(currentRoll - movementsResponse.in + movementsResponse.out) },
        { name: 'In today', value: safeNumber(movementsResponse.in) },
        { name: 'Out today', value: safeNumber(movementsResponse.out) },
        { name: 'Current roll', value: safeNumber(currentRoll) },
        {
          name: 'In reception',
          value: safeNumber(unassignedIn),
        },
        {
          name: 'En-route',
          value: safeNumber(enroute),
        },
      ],
    }
    const blocks = assignedResponse.map(block => ({
      name: capitalize(block.livingUnitDesc),
      numbers: [
        { name: 'Beds in use', value: safeNumber(block.bedsInUse) },
        { name: 'Currently in cell', value: safeNumber(block.currentlyInCell) },
        { name: 'Currently out', value: safeNumber(block.currentlyOut) },
        { name: 'Operational cap.', value: safeNumber(block.operationalCapacity) },
        { name: 'Net vacancies', value: safeNumber(block.netVacancies) },
        { name: 'Out of order', value: safeNumber(block.outOfOrder) },
      ],
    }))

    const totals = {
      name: 'Totals',
      numbers: [
        { name: 'Total roll', value: getTotals(assignedResponse, 'bedsInUse') },
        { name: 'Total in cell', value: getTotals(assignedResponse, 'currentlyInCell') },
        { name: 'Total out', value: getTotals(assignedResponse, 'currentlyOut') },
        { name: 'Total op. cap.', value: getTotals(assignedResponse, 'operationalCapacity') },
        { name: 'Total vacancies', value: getTotals(assignedResponse, 'netVacancies') },
        { name: 'Total out of order', value: getTotals(assignedResponse, 'outOfOrder') },
      ],
    }

    return { movements, blocks, totals }
  }

  return {
    getEstablishmentRollCount,
  }
}

module.exports = {
  getEstablishmentRollCountFactory,
}
