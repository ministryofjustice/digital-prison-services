const healthApiFactory = (elite2ApiClient) => {
  const isUp = () => Promise
    .all([
      elite2ApiClient.get({}, 'health').then(() => true, () => false)
    ])
    .then(values => values.reduce((acc, value) => acc && value), true);

  return {
    isUp
  };
};

module.exports = {
  healthApiFactory
};

