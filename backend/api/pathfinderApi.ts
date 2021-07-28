export const pathfinderApiFactory = (client) => {
  const processResponse = () => (response) => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())

  const getPathfinderDetails = (context, offenderNo) => get(context, `/soc/nominal/nomsId/${offenderNo}`)

  return {
    getPathfinderDetails,
  }
}

export default {
  pathfinderApiFactory,
}
