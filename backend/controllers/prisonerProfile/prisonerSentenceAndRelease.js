const { serviceUnavailableMessage } = require('../../common-messages')

module.exports = ({ prisonerProfileService, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const prisonerProfileData = await prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo)
    const { sentenceDetail } = prisonerProfileData

    return res.render('prisonerProfile/prisonerSentenceAndRelease.njk', {
      prisonerProfileData,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}/sentence-and-release` })
  }
}
