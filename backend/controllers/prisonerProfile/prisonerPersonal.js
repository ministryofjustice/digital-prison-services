const { serviceUnavailableMessage } = require('../../common-messages')
const logErrorAndContinue = require('../../shared/logErrorAndContinue')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const {
  aliasesViewModel,
  distinguishingMarksViewModel,
  identifiersViewModel,
  personalDetailsViewModel,
  physicalCharacteristicsViewModel,
} = require('./personalViewModels')

module.exports = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const basicPrisonerDetails = await elite2Api
    .getDetails(res.locals, offenderNo)
    .then(data => data)
    .catch(error => {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: dpsUrl })
    })
  const { bookingId } = basicPrisonerDetails || {}

  const [prisonerProfileData, fullPrisonerDetails, identifiers, aliases, property] = await Promise.all(
    [
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getPrisonerDetail(res.locals, bookingId),
      elite2Api.getIdentifiers(res.locals, bookingId),
      elite2Api.getOffenderAliases(res.locals, bookingId),
      elite2Api.getPrisonerProperty(res.locals, bookingId),
    ].map(apiCall => logErrorAndContinue(apiCall))
  )

  const { physicalAttributes, physicalCharacteristics, physicalMarks } = fullPrisonerDetails

  return res.render('prisonerProfile/prisonerPersonal/prisonerPersonal.njk', {
    prisonerProfileData,
    aliases: aliasesViewModel({ aliases }),
    distinguishingMarks: distinguishingMarksViewModel({ physicalMarks }),
    identifiers: identifiersViewModel({ identifiers }),
    personalDetails: personalDetailsViewModel({ prisonerDetails: fullPrisonerDetails, property }),
    physicalCharacteristics: physicalCharacteristicsViewModel({ physicalAttributes, physicalCharacteristics }),
  })
}
