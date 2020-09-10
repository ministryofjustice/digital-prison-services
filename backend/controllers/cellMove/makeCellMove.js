module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { location } = req.body

  try {
    if (!location) return res.redirect(`/prisoner/${offenderNo}/cell-move/select-cell`)

    const { bookingId } = await elite2Api.getDetails(res.locals, offenderNo)

    await elite2Api.moveToCell(res.locals, { bookingId, internalLocationDescription: location })

    return res.redirect(`/prisoner/${offenderNo}/cell-move/cell-move-confirmation?=location=${location}&=${offenderNo}`)
  } catch (error) {
    if (error) logError(req.originalUrl, error, 'Failed to make cell move')

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-cell`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
