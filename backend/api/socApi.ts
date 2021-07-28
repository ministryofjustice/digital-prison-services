export const socApiFactory = (client) => {
  const processResponse = () => (response) => response.body
  const get = (context, url) => client.get(context, url).then(processResponse())
  const getSocDetails = (context, offenderNo, socEnabled) =>
    socEnabled ? get(context, `/soc/nominal/nomsId/${offenderNo}`) : Promise.resolve(null)
  return {
    getSocDetails,
  }
}

export default {
  socApiFactory,
}
