import { Request, Response } from 'express'
import { formatName, isRedirectCaseLoad } from '../../utils'
import config from '../../config'

export default (prisonApi) => {
  const view = async (req: Request, res: Response) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails
    const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo, false)
    const data = {
      offenderName: formatName(firstName, lastName),
      offenderNo,
      backUrl: req.headers.referer,
      locationDetailsUrl: isRedirectCaseLoad(activeCaseLoadId)
        ? `${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}/location-details`
        : `/prisoners/${offenderNo}/cell-history`,
    }

    return res.render('receptionMoves/receptionFull.njk', data)
  }

  return { view }
}
