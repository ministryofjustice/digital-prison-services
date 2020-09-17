const { properCaseName, putLastNameFirst } = require('../../utils')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const { firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)

    return res.render('cellMove/cswapConfirmation.njk', {
      title: `${properCaseName(firstName)} ${properCaseName(lastName)} has been moved to cell swap`,
      name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      offenderNo,
      prisonerProfileLink: `/prisoner/${offenderNo}`,
      prisonerSearchLink: '/prisoner-search',
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, 'Failed to load cswap confirmation page')

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-location`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
