const socApiFactory = client => {
  const processResponse = () => response => response.body
  const get = (context, url) => client.get(context, url).then(processResponse())
  const getSocDetails = (context, offenderNo, socEnabled) =>
    socEnabled ? get(context, `/offender/${offenderNo}`) : Promise.resolve(null)
  return {
    getSocDetails,
  }
}

module.exports = {
  socApiFactory,
}
