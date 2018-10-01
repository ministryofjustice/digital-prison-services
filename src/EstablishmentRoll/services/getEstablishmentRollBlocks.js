import axios from 'axios';

export const getEstablishmentRollBlocksCount = (agencyId, unassigned) =>
  axios.get('/api/establishmentRollBlocksCount', {
    params: {
      agencyId,
      unassigned
    }
  });

export const getEstablishmentRollMovementsCount = agencyId =>
  axios.get('/api/establishmentRollMovementsCount', {
    params: {
      agencyId
    }
  });
