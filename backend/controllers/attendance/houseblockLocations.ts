export const getHouseblockLocationsFactory = (getClientCredentialsTokens, locationsInsidePrisonApi, logError) => {
  const getHouseblockLocations = async (req, res) => {
    try {
      const systemContext = await getClientCredentialsTokens()

      const response = await locationsInsidePrisonApi.getSearchGroups(systemContext, req.query.agencyId)
      return res.json(response)
    } catch (error) {
      if (error.code === 'ECONNRESET' || (error.stack && error.stack.toLowerCase().includes('timeout')))
        return res.end()
      logError(req.originalUrl, error, 'getHouseblockLocations()')

      const errorStatusCode = (error && error.status) || (error.response && error.response.status) || 500
      res.status(errorStatusCode)
      return res.end()
    }
  }

  return { getHouseblockLocations }
}

export default { getHouseblockLocationsFactory }
