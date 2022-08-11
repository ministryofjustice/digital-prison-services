import { CaseLoad } from '../api/prisonApi'
import logger from '../log'
import { forenameToInitial } from '../utils'

export type User = {
  allCaseloads: CaseLoad[]
  displayName: string
  activeCaseLoad?: CaseLoad
}
export default ({ prisonApi, oauthApi }) => {
  const getActiveCaseload = async (req, res) => {
    const { activeCaseLoadId, username } = req.session.userDetails
    const { allCaseloads: caseloads } = req.session

    const activeCaseLoad = caseloads.find((cl) => cl.caseLoadId === activeCaseLoadId)
    if (activeCaseLoad) {
      return activeCaseLoad
    }

    const potentialCaseLoad = caseloads.find((cl) => cl.caseLoadId !== '___')
    if (potentialCaseLoad) {
      const firstCaseLoadId = potentialCaseLoad.caseLoadId
      logger.warn(`No active caseload set for user: ${username}: setting to ${firstCaseLoadId}`)
      await prisonApi.setActiveCaseload(res.locals, potentialCaseLoad)

      req.session.userDetails.activeCaseLoadId = firstCaseLoadId

      return potentialCaseLoad
    }

    logger.warn(`No available caseload to set for user: ${username}`)
    return null
  }

  return async (req, res, next) => {
    if (!req.xhr) {
      if (!req.session.userDetails) {
        const userDetails = await oauthApi.currentUser(res.locals)
        const allCaseloads = await prisonApi.userCaseLoads(res.locals)

        req.session.userDetails = userDetails
        req.session.allCaseloads = allCaseloads
      }

      const activeCaseLoad = await getActiveCaseload(req, res)

      const user: User = {
        ...res.locals.user,
        allCaseloads: req.session.allCaseloads,
        displayName: forenameToInitial(req.session.userDetails.name),
        activeCaseLoad,
      }

      res.locals.user = user
    }

    next()
  }
}
