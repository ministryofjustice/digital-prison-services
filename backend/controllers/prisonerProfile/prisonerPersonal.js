const { serviceUnavailableMessage } = require('../../common-messages')
const logErrorAndContinue = require('../../shared/logErrorAndContinue')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const getIdentifierValue = (type, identifiers) => {
  const identifier = identifiers && identifiers.length > 0 ? identifiers.find(id => id.type === type) : identifiers

  return identifier && identifier.value
}

module.exports = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const details = await elite2Api
    .getDetails(res.locals, offenderNo)
    .then(data => data)
    .catch(error => {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: dpsUrl })
    })
  const { bookingId } = details || {}

  const [prisonerProfileData, identifierData] = await Promise.all(
    [
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getIdentifiers(res.locals, bookingId),
    ].map(apiCall => logErrorAndContinue(apiCall))
  )

  return res.render('prisonerProfile/prisonerPersonal.njk', {
    prisonerProfileData,
    identifiers: [
      { label: 'PNC number', value: getIdentifierValue('PNC', identifierData) },
      { label: 'CRO number', value: getIdentifierValue('CRO', identifierData) },
      { label: 'National insurance number', value: getIdentifierValue('NINO', identifierData) },
      { label: 'Home office reference number', value: getIdentifierValue('HOREF', identifierData) },
      { label: 'Driving licence number', value: getIdentifierValue('DL', identifierData) },
    ],
  })
}
