// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'properCase... Remove this comment to see the full error message
const { properCaseName } = require('../../utils')

module.exports =
  ({ prisonApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo)

    return res.render('prisonerProfile/prisonerFullImage.njk', {
      backUrl: req.headers.referer || `/prisoner/${offenderNo}`,
      offenderNo,
      offenderName: `${properCaseName(prisonerDetails.lastName)}, ${properCaseName(prisonerDetails.firstName)}`,
    })
  }
