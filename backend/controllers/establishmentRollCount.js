const getTotals = (array, figure) => array.reduce((accumulator, block) => accumulator + block[figure], 0)

const getEstablishmentRollCountFactory = elite2Api => {
  const getEstablishmentRollCount = async (context, agencyId) => {
    const [assignedResponse, unassignedResponse, movementsResponse] = await Promise.all([
      elite2Api.getEstablishmentRollBlocksCount(context, agencyId, false),
      elite2Api.getEstablishmentRollBlocksCount(context, agencyId, true),
      elite2Api.getEstablishmentRollMovementsCount(context, agencyId),
    ])

    const totalRoll = getTotals(assignedResponse, 'bedsInUse')

    const movements = {
      name: "Today's movements",
      numbers: [
        { name: 'Unlock roll', value: totalRoll - movementsResponse.in + movementsResponse.out },
        { name: 'In today', value: movementsResponse.in },
        { name: 'Out today', value: movementsResponse.out },
        { name: 'Current roll', value: totalRoll },
        {
          name: 'Unassigned',
          value: getTotals(unassignedResponse, 'currentlyInCell'),
        },
      ],
    }

    const blocks = assignedResponse.map(block => ({
      name: block.livingUnitDesc,
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
        { name: 'Total roll', value: totalRoll },
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
