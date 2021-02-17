const { properCaseName, putLastNameFirst } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ prisonApi }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const { cellId } = req.query
    const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)
    const { description } = await prisonApi.getLocation(res.locals, cellId)

    return res.render('cellMove/confirmation.njk', {
      title: `${properCaseName(firstName)} ${properCaseName(lastName)} has been moved to cell ${description}`,
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      offenderNo,
      prisonerProfileLink: `/prisoner/${offenderNo}`,
      prisonerSearchLink: '/prisoner-search',
      dpsUrl,
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}/cell-move/search-for-cell`
    res.locals.homeUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
