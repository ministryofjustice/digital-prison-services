const getEstablishmentRollCountFactory = (elite2Api) => {
  const getEstablishmentRollBlocksCount = async (context, agencyId, unassigned) => {
    const response = await elite2Api.getEstablishmentRollBlocksCount(context, agencyId, unassigned);
    const getTotals = (array, figure) => {
      return array.reduce((accumulator, block) => accumulator + (block[figure]), 0);
    };

    const blocks = response.map((block) => ({
      name: block.livingUnitDesc,
      numbers: [
        { name: 'Beds in use', value: block.bedsInUse },
        { name: 'Currently in cell', value: block.currentlyInCell },
        { name: 'Currently out', value: block.currentlyOut },
        { name: 'Operational cap.', value: block.operationalCapacity },
        { name: 'Net vacancies', value: block.netVacancies },
        { name: 'Out of order', value: block.outOfOrder }
      ]
    }));

    const totals = {
      name: 'Totals',
      numbers: [
        { name: 'Total roll', value: getTotals(response, 'bedsInUse') },
        { name: 'Total in cell', value: getTotals(response, 'currentlyInCell') },
        { name: 'Total out', value: getTotals(response, 'currentlyOut') },
        { name: 'Total op. cap.', value: getTotals(response, 'operationalCapacity') },
        { name: 'Total vacancies', value: getTotals(response, 'netVacancies') },
        { name: 'Total out of order', value: getTotals(response, 'outOfOrder') }
      ]
    };

    return { blocks, totals };
  };

  const getEstablishmentRollMovementsCount = async (context, agencyId) => {
    const response = await elite2Api.getEstablishmentRollMovementsCount(context, agencyId);
    return response;
  };

  return {
    getEstablishmentRollBlocksCount,
    getEstablishmentRollMovementsCount
  };
};

module.exports = {
  getEstablishmentRollCountFactory
};
