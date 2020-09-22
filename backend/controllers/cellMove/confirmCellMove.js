const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

const { properCaseName, putLastNameFirst } = require('../../utils')

module.exports = ({ elite2Api, logError }) => {
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { cellId } = req.query

    if (!cellId) return res.redirect(`/prisoner/${offenderNo}/cell-move/select-cell`)

    const { locationPrefix, description } =
      cellId === 'C-SWAP'
        ? {
            description: 'swap',
          }
        : await elite2Api.getLocation(res.locals, cellId)

    const { firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)

    return res.render('cellMove/confirmCellMove.njk', {
      showWarning: cellId !== 'C-SWAP',
      offenderNo,
      description,
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
      cellId,
      locationPrefix,
      selectCellUrl: `/prisoner/${offenderNo}/cell-move/select-cell`,
    })
  }

  const makeCellMove = async (res, { cellId, bookingId, agencyId, offenderNo }) => {
    const { capacity } = await elite2Api.getAttributesForLocation(res.locals, cellId)
    const { locationPrefix, description } = await elite2Api.getLocation(res.locals, cellId)

    try {
      await elite2Api.moveToCell(res.locals, { bookingId, internalLocationDescription: locationPrefix })
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

  const makeCSwap = async (res, { bookingId, agencyId, offenderNo }) => {
    await elite2Api.moveToCellSwap(res.locals, { bookingId })

    raiseAnalyticsEvent('Cell move', `Cell move for ${agencyId}`, `Cell type - C-SWAP`)

    return res.redirect(`/prisoner/${offenderNo}/cell-move/cswap-confirmation`)
  }

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const { cellId } = req.body

    try {
      if (!cellId) return res.redirect(`/prisoner/${offenderNo}/cell-move/select-cell`)

      const { bookingId, agencyId } = await elite2Api.getDetails(res.locals, offenderNo)

      if (cellId === 'C-SWAP') return await makeCSwap(res, { agencyId, bookingId, offenderNo })

      return await makeCellMove(res, { cellId, bookingId, agencyId, offenderNo })
    } catch (error) {
      if (error) logError(req.originalUrl, error, `Failed to make cell move to ${cellId}`)

      return res.render('error.njk', {
        url: `/prisoner/${offenderNo}/cell-move/select-cell`,
        homeUrl: `/prisoner/${offenderNo}`,
      })
    }
  }

  return {
    index,
    post,
  }
}
