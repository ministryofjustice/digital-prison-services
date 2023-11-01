import { Request, Response } from 'express'
import { formatName } from '../../utils'

export default (prisonApi) => {
  const view = async (req: Request, res: Response) => {
    const { offenderNo } = req.params
    const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo, false)
    const data = {
      offenderName: formatName(firstName, lastName),
      offenderNo,
      backUrl: req.headers.referer,
    }

    return res.render('receptionMoves/receptionFull.njk', data)
  }

  return { view }
}
