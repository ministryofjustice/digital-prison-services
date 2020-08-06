const getHouseblockLocationsFactory = ({ whereaboutsApi, logError }) => {
  const getHouseblockLocations = async (req, res) => {
    try {
      const response = await whereaboutsApi.searchGroups(res.locals, req.query.agencyId)
      res.json(response)
    } catch (error) {
      if (error.code === 'ECONNRESET') return
      logError(req.originalUrl, error, 'Error trying to retrieve groups')
    }
  }

  return { getHouseblockLocations }
}

module.exports = { getHouseblockLocationsFactory }
