import asyncMiddleware from '../middleware/asyncHandler'

export const userCaseloadsFactory = (prisonApi) => {
  const userCaseloads = asyncMiddleware(async (req, res) => {
    const data = await prisonApi.userCaseLoads(res.locals)
    res.json(data)
  })

  return {
    userCaseloads,
  }
}

export default {
  userCaseloadsFactory,
}
