const { serviceUnavailableMessage } = require('../../common-messages')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { properCaseName } = require('../../utils')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  try {
    const { offenderNo } = req.params
    const prisonerDetails = await elite2Api.getDetails(res.locals, offenderNo)

    return res.render('prisonerProfile/prisonerFullImage.njk', {
      backUrl: req.headers.referer || `/prisoner/${offenderNo}`,
      offenderNo,
      offenderName: `${properCaseName(prisonerDetails.lastName)}, ${properCaseName(prisonerDetails.firstName)}`,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: dpsUrl })
  }
}
