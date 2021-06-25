const { putLastNameFirst } = require('../../utils')

module.exports =
  ({ prisonApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const { cellDescription } = req.query

    try {
      if (!cellDescription) return res.redirect(`/prisoner/${offenderNo}/cell-move/select-cell`)

      const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)

      return res.render('cellMove/cellNotAvailable.njk', {
        header: `Cell ${cellDescription} is no longer available`,
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        offenderNo,
        selectCellUrl: `/prisoner/${offenderNo}/cell-move/select-cell`,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}/cell-move/search-for-cell`
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
