const { serviceUnavailableMessage } = require('../../common-messages')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { properCaseName } = require('../../utils')

module.exports = ({ prisonApi, logError }) => async (req, res) => {
  try {
    const { offenderNo } = req.params
    const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo)

    return res.render('prisonerProfile/prisonerFullImage.njk', {
      backUrl: req.headers.referer || `/prisoner/${offenderNo}`,
      offenderNo,
      offenderName: `${properCaseName(prisonerDetails.lastName)}, ${properCaseName(prisonerDetails.firstName)}`,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    res.status(500)
    return res.render('error.njk', { url: dpsUrl })
  }
}
