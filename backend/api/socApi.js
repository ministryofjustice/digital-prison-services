const socApiFactory = client => {
  const processResponse = () => response => response.body
  const get = (context, url) => client.get(context, url).then(processResponse())
  const getSocDetails = (context, offenderNo) => get(context, `/offender/${offenderNo}`)
  return {
    getSocDetails,
  }
}

module.exports = {
  socApiFactory,
}
