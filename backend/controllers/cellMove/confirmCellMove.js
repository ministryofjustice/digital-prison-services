const { properCaseName, putLastNameFirst } = require('../../utils')

module.exports = ({ elite2Api, logError }) => {
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { cellId } = req.query

    if (!cellId) return res.redirect(`/prisoner/${offenderNo}/cell-move/select-cell`)

    const { locationPrefix, description } = await elite2Api.getLocation(res.locals, cellId)

    const { firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)

    return res.render('cellMove/confirmCellMove.njk', {
      offenderNo,
      description,
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
      cellId,
      locationPrefix,
      selectCellUrl: `/prisoner/${offenderNo}/cell-move/select-cell`,
    })
  }

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const { cellId } = req.body

    try {
      if (!cellId) return res.redirect(`/prisoner/${offenderNo}/cell-move/select-cell`)

      const { locationPrefix } = await elite2Api.getLocation(res.locals, cellId)

      const { bookingId } = await elite2Api.getDetails(res.locals, offenderNo)

      await elite2Api.moveToCell(res.locals, { bookingId, internalLocationDescription: locationPrefix })

      return res.redirect(`/prisoner/${offenderNo}/cell-move/confirmation?cellId=${cellId}`)
    } catch (error) {
      if (error) logError(req.originalUrl, error, 'Failed to make cell move')

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
