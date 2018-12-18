const { capitalize } = require('../utils')

const getTotals = (array, figure) => array.reduce((accumulator, block) => accumulator + block[figure], 0)

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
        { name: 'Unlock roll', value: currentRoll - movementsResponse.in + movementsResponse.out },
        { name: 'In today', value: movementsResponse.in },
        { name: 'Out today', value: movementsResponse.out },
        { name: 'Current roll', value: currentRoll },
        {
          name: 'In reception',
          value: unassignedIn,
        },
        {
          name: 'En-route',
          value: enroute,
        },
      ],
    }

    const blocks = assignedResponse.map(block => ({
      name: capitalize(block.livingUnitDesc),
      numbers: [
        { name: 'Beds in use', value: block.bedsInUse },
        { name: 'Currently in cell', value: block.currentlyInCell },
        { name: 'Currently out', value: block.currentlyOut },
        { name: 'Operational cap.', value: block.operationalCapacity },
        { name: 'Net vacancies', value: block.netVacancies },
        { name: 'Out of order', value: block.outOfOrder },
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
