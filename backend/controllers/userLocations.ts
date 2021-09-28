import asyncMiddleware from '../middleware/asyncHandler'

export const userLocationsFactory = (prisonApi) => {
  const userLocations = asyncMiddleware(async (req, res) => {
    const locations = await prisonApi.userLocations(res.locals)
    res.json(locations)
  })

  return {
    userLocations,
  }
}

export default {
  userLocationsFactory,
}
