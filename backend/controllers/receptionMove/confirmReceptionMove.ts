import { Request, Response, RequestHandler } from 'express'
import { properCaseName } from '../../utils'
import logger from '../../log'

const sortOnListSeq = (a, b) => a.listSeq - b.listSeq

const receptionMoveReasons = async (res, prisonApi, selectedReason) => {
  const receptionMoveReasonTypes = await prisonApi.getCellMoveReasonTypes(res.locals)
  return receptionMoveReasonTypes
    .filter((type) => type.activeFlag === 'Y')
    .sort(sortOnListSeq)
    .map((type) => ({
      value: type.code,
      text: type.description,
      checked: type.code === selectedReason,
    }))
}
const validate = ({ reason, comment }) => {
  const errors = []

  if (!reason) errors.push({ href: '#reason', text: 'Select a reason for the move' })
  if (!comment) errors.push({ href: '#comment', text: 'Explain why the person is being moved to reception' })
  if (comment && comment.length < 7) {
    errors.push({
      href: '#comment',
      text: 'Provide more detail about why this person is being moved to reception',
    })
  }
  if (comment && comment.length > 4000) {
    errors.push({
      href: '#comment',
      text: 'Enter what happened for you to move this person reception using 4,000 characters or less',
    })
  }

  return errors
}

export default ({ prisonApi, whereaboutsApi }) => {
  const view = async (req: Request, res: Response) => {
    const { offenderNo } = req.params
    const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo, false)

    let backUrl = `/prisoner/${offenderNo}/reception-move/consider-risks-reception`

    if (!req.headers.referer) {
      backUrl = null
    }

    const formValues = req.flash('formValues') as Record<string, string>[]
    const { reason, comment } = (formValues && formValues[0]) || {}
    const receptionMoveReasonRadioValues = await receptionMoveReasons(res, prisonApi, reason)
    const cancelLinkHref = `/prisoner/${offenderNo}/location-details`

    const data = {
      offenderName: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
      offenderNo,
      backUrl,
      cancelLinkHref,
      receptionMoveReasonRadioValues,
      errors: req.flash('errors'),
      formValues: {
        comment,
      },
    }

    return res.render('receptionMoves/confirmReceptionMove.njk', data)
  }

  const post: RequestHandler = async (req: Request, res: Response) => {
    const { offenderNo } = req.params
    const { reason, comment } = req.body
    req.flash('formValues', { reason, comment })
    const errors = validate({ reason, comment })

    if (errors.length) {
      req.flash('errors', errors)
      return res.redirect(`/prisoner/${offenderNo}/reception-move/confirm-reception-move`)
    }

    const { bookingId, agencyId } = await prisonApi.getDetails(res.locals, offenderNo, true)
    const receptionOccupancy = await prisonApi.getReceptionsWithCapacity(res.locals, agencyId)

    if (!receptionOccupancy.length) {
      logger.info('Can not move to reception as already full to capacity')
      return res.redirect(`/prisoner/${offenderNo}/reception-move/reception-full`)
    }

    try {
      await whereaboutsApi.moveToCell(res.locals, {
        bookingId,
        offenderNo,
        internalLocationDescriptionDestination: receptionOccupancy[0].description,
        cellMoveReasonCode: reason,
        commentText: comment,
      })

      return res.redirect(`/prisoner/${offenderNo}/reception-move/confirmation`)
    } catch (error) {
      logger.error(`Error moving ${offenderNo} to reception`)
      res.locals.redirectUrl = `/prisoner/${offenderNo}/reception-move/consider-risks-reception`
      throw error
    }
  }

  return { view, post }
}
