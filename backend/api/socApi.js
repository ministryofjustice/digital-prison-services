const socApiFactory = client => {
  const processResponse = () => response => response.body
  const get = (context, url) => client.get(context, url).then(processResponse())
  const getSocDetais = (context, offenderNo) => get(context, `/offender/${offenderNo}`)
  return {
    getSocDetais,
  }
}

module.exports = {
  socApiFactory,
}
