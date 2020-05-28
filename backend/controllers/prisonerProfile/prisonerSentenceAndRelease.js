const releaseDatesViewModel = require('./sentenceAndReleaseViewModels/releaseDatesViewModel')
const { serviceUnavailableMessage } = require('../../common-messages')

module.exports = ({ prisonerProfileService, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const prisonerProfileData = await prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo)
    const releaseDates = releaseDatesViewModel(prisonerProfileData.sentenceDetail)

    return res.render('prisonerProfile/prisonerSentenceAndRelease/prisonerSentenceAndRelease.njk', {
      prisonerProfileData,
      releaseDates,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}/sentence-and-release` })
  }
}
