const socApiFactory = client => {
  const processResponse = () => response => response.body
  const get = (context, url) => client.get(context, url).then(processResponse())
  const getSocDetais = (context, nomisId) => get(context, `/offender/${nomisId}`)
  return {
    getSocDetais,
  }
}

module.exports = {
  socApiFactory,
}
