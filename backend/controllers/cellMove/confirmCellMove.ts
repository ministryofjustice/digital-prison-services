import { raiseAnalyticsEvent } from '../../raiseAnalyticsEvent'
import { properCaseName, putLastNameFirst } from '../../utils'
import { getConfirmBackLinkData } from './cellMoveUtils'

const CSWAP = 'C-SWAP'

const sortOnListSeq = (a, b) => a.listSeq - b.listSeq

const cellMoveReasons = async (res, prisonApi, selectedReason) => {
  const cellMoveReasonTypes = await prisonApi.getCellMoveReasonTypes(res.locals)
  return cellMoveReasonTypes
    .filter((type) => type.activeFlag === 'Y')
    .sort(sortOnListSeq)
    .map((type) => ({
      value: type.code,
      text: type.description,
      checked: type.code === selectedReason,
    }))
}

export default ({ systemOauthClient, cellAllocationApi, prisonApi, whereaboutsApi }) => {
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { cellId } = req.query
    const isCellSwap = cellId === CSWAP

    if (!cellId) return res.redirect(`/prisoner/${offenderNo}/cell-move/select-cell`)

    // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
    const { locationPrefix, description } = isCellSwap
      ? { description: 'swap' }
      : await prisonApi.getLocation(res.locals, cellId)

    const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)

    const formValues = req.flash('formValues')
    const { reason, comment } = (formValues && formValues[0]) || {}

    const cellMoveReasonRadioValues = isCellSwap ? undefined : await cellMoveReasons(res, prisonApi, reason)

    const { backLink, backLinkText } = getConfirmBackLinkData(req.headers.referer, offenderNo)
    return res.render('cellMove/confirmCellMove.njk', {
      showWarning: !isCellSwap,
      offenderNo,
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
      cellId,
      movingToHeading: isCellSwap ? 'out of their current location' : `to cell ${description}`,
      locationPrefix,
      cellMoveReasonRadioValues,
      errors: req.flash('errors'),
      formValues: {
        comment,
      },
      backLink,
      backLinkText,
      showCommentInput: !isCellSwap,
    })
  }

  const makeCellMove = async (res, { cellId, bookingId, agencyId, offenderNo, reasonCode, commentText }) => {
    const { capacity } = await prisonApi.getAttributesForLocation(res.locals, cellId)
    const { locationPrefix, description } = await prisonApi.getLocation(res.locals, cellId)

    try {
      await whereaboutsApi.moveToCell(res.locals, {
        bookingId,
        offenderNo,
        internalLocationDescriptionDestination: locationPrefix,
        cellMoveReasonCode: reasonCode,
        commentText,
      })
    } catch (error) {
      if (error.status === 400)
        return res.redirect(`/prisoner/${offenderNo}/cell-move/cell-not-available?cellDescription=${description}`)
      throw error
    }

    raiseAnalyticsEvent(
      'Cell move',
      `Cell move for ${agencyId}`,
      `Cell type - ${capacity === 1 ? 'Single occupancy' : 'Multi occupancy'}`
    )

    return res.redirect(`/prisoner/${offenderNo}/cell-move/confirmation?cellId=${cellId}`)
  }

  const makeCSwap = async (req, res, { bookingId, agencyId, offenderNo }) => {
    const { username } = req.session.userDetails

    const systemContext = await systemOauthClient.getClientCredentialsTokens(username)

    await cellAllocationApi.moveToCellSwap(systemContext, { bookingId })

    raiseAnalyticsEvent('Cell move', `Cell move for ${agencyId}`, `Cell type - C-SWAP`)

    return res.redirect(`/prisoner/${offenderNo}/cell-move/space-created`)
  }

  const validate = ({ reason, comment }) => {
    const errors = []

    if (!reason) errors.push({ href: '#reason', text: 'Select the reason for the cell move' })
    if (!comment) errors.push({ href: '#comment', text: 'Enter what happened for you to change this person’s cell' })
    if (comment && comment.length < 7) {
      errors.push({
        href: '#comment',
        text: 'Enter a real explanation of what happened for you to change this person’s cell',
      })
    }
    if (comment && comment.length > 4000) {
      errors.push({
        href: '#comment',
        text: 'Enter what happened for you to change this person’s cell using 4,000 characters or less',
      })
    }

    return errors
  }

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const { cellId, reason, comment } = req.body

    if (!cellId) return res.redirect(`/prisoner/${offenderNo}/cell-move/select-cell`)

    if (cellId !== CSWAP) {
      const errors = validate({ reason, comment })

      if (errors.length) {
        req.flash('formValues', { comment, reason })
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${offenderNo}/cell-move/confirm-cell-move?cellId=${cellId}`)
      }
    }

    try {
      const { bookingId, agencyId } = await prisonApi.getDetails(res.locals, offenderNo)

      if (cellId === CSWAP) return await makeCSwap(req, res, { agencyId, bookingId, offenderNo })

      return await makeCellMove(res, {
        cellId,
        bookingId,
        agencyId,
        offenderNo,
        reasonCode: reason,
        commentText: comment,
      })
    } catch (error) {
      res.locals.logMessagev = `Failed to make cell move to ${cellId}`
      res.locals.redirectUrl = `/prisoner/${offenderNo}/cell-move/select-cell`
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }

  return {
    index,
    post,
  }
}
