const pathfinderApiFactory = client => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())

  const getPathfinderDetails = (context, offenderNo) => get(context, `/pathfinder/offender/${offenderNo}`)

  return {
    getPathfinderDetails,
  }
}

module.exports = {
  pathfinderApiFactory,
}
