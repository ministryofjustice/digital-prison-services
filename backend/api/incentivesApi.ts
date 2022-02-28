export const incentivesApiFactory = (client) => {
  const processResponse = () => (response) => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())

  const getAgencyIepLevels = (context, agencyId) => get(context, `/iep/levels/${agencyId}`)

  return {
    getAgencyIepLevels,
  }
}

export default { incentivesApiFactory }
