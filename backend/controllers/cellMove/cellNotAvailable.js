const { putLastNameFirst } = require('../../utils')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { cellDescription } = req.query

  try {
    if (!cellDescription) return res.redirect(`/prisoner/${offenderNo}/cell-move/select-cell`)

    const { firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)

    return res.render('cellMove/cellNotAvailable.njk', {
      header: `Cell ${cellDescription} is no longer available`,
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      offenderNo,
      selectCellUrl: `/prisoner/${offenderNo}/cell-move/select-cell`,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, 'Failed to load offender details on cell not available page')

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-location`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
