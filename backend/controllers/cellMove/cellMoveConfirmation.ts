// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatName... Remove this comment to see the full error message
const { formatName, putLastNameFirst } = require('../../utils')

module.exports =
  ({ prisonApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    try {
      const { cellId } = req.query
      const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)
      const { description } = await prisonApi.getLocation(res.locals, cellId)

      return res.render('cellMove/confirmation.njk', {
        confirmationMessage: `${formatName(firstName, lastName)} has been moved to cell ${description}`,
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        offenderNo,
        prisonerProfileLink: `/prisoner/${offenderNo}`,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}/cell-move/search-for-cell`
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
