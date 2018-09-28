import axios from 'axios';

export const getEstablishmentRollCount = (agencyId, unassigned) =>
  axios.get('/api/establishmentRollCount', {
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
