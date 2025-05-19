import jwtDecode from 'jwt-decode'
import { NextFunction, Request, Response } from 'express'
import { CaseLoad } from '../api/prisonApi'
import logger from '../log'
import { forenameToInitial } from '../utils'

export type User = {
  allCaseloads: CaseLoad[]
  displayName: string
  activeCaseLoad?: CaseLoad
}
export default ({ prisonApi, hmppsManageUsersApi, getClientCredentialsTokens }) => {
  const getActiveCaseload = async (req, res) => {
    const { activeCaseLoadId, username } = req.session.userDetails
    const { allCaseloads: caseloads } = req.session

    const activeCaseLoad = caseloads.find((cl) => cl.caseLoadId === activeCaseLoadId)
    if (activeCaseLoad) {
      return activeCaseLoad
    }

    const potentialCaseLoad = caseloads.find((cl) => cl.caseLoadId !== '___')
    if (potentialCaseLoad) {
      const systemContext = await getClientCredentialsTokens(username)
      const firstCaseLoadId = potentialCaseLoad.caseLoadId
      logger.warn(`No active caseload set for user: ${username}: setting to ${firstCaseLoadId}`)
      await prisonApi.setActiveCaseload(systemContext, potentialCaseLoad)

      req.session.userDetails.activeCaseLoadId = firstCaseLoadId

      return potentialCaseLoad
    }

    logger.warn(`No available caseload to set for user: ${username}`)
    return null
  }

  const getUserRoles = async (req, res) => {
    try {
      const { authorities: roles = [] } = jwtDecode(res.locals.access_token) as { authorities?: string[] }
      if (!roles) {
        logger.info('No user roles available')
      }
      return roles
    } catch (error) {
      logger.warn(error, 'Failed to retrieve roles')
    }
    return null
  }

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.xhr) {
      if (!req.session.userDetails) {
        const userDetails = await hmppsManageUsersApi.currentUser(res.locals)
        const allCaseloads = await prisonApi.userCaseLoads(res.locals)

        req.session.userDetails = userDetails
        req.session.allCaseloads = allCaseloads
      }

      const userRoles = await getUserRoles(req, res)
      const activeCaseLoad = await getActiveCaseload(req, res)

      res.locals.user = {
        ...res.locals.user,
        username: req.session.userDetails.username,
        userRoles,
        allCaseloads: req.session.allCaseloads,
        displayName: forenameToInitial(req.session.userDetails.name),
        activeCaseLoad,
        backLink: req.session.userBackLink,
      }
    }

    next()
  }
}
