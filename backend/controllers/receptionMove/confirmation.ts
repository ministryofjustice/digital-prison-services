import { Request, Response } from 'express'
import { formatName } from '../../utils'

export default (prisonApi) => {
  const view = async (req: Request, res: Response) => {
    const { offenderNo } = req.params
    const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo, false)
    const profileUrl = `/prisoner/${offenderNo}`
    const data = {
      confirmationMessage: `${formatName(firstName, lastName)} has been moved to reception`,
      profileUrl,
      offenderNo,
    }

    return res.render('receptionMoves/confirmation.njk', data)
  }
  return { view }
}
