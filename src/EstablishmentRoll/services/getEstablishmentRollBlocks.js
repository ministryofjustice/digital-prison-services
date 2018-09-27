import axios from 'axios';

export default async agencyId => {
  const response = await axios.get('/api/establishmentRollCount', {
    params: {
      agencyId
    }
  });

  return response.data;
};
