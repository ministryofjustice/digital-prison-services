const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const logErrorAndContinue = require('../../shared/logErrorAndContinue')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { putLastNameFirst } = require('../../utils')

const getValueByType = (type, array, key) => {
  const value = array && array.length > 0 ? array.find(item => item.type === type) : array

  return value && value[key]
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

  const [
    prisonerProfileData,
    identifierData,
    aliasesData,
    physicalAttributesData,
    physicalCharacteristicsData,
  ] = await Promise.all(
    [
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getIdentifiers(res.locals, bookingId),
      elite2Api.getOffenderAliases(res.locals, bookingId),
      elite2Api.getPhysicalAttributes(res.locals, bookingId),
      elite2Api.getPhysicalCharacteristics(res.locals, bookingId),
    ].map(apiCall => logErrorAndContinue(apiCall))
  )

  const { heightMetres, weightKilograms } = physicalAttributesData || {}

  return res.render('prisonerProfile/prisonerPersonal.njk', {
    prisonerProfileData,
    identifiers: [
      { label: 'PNC number', value: getValueByType('PNC', identifierData, 'value'), alwaysShow: true },
      { label: 'CRO number', value: getValueByType('CRO', identifierData, 'value') },
      { label: 'National insurance number', value: getValueByType('NINO', identifierData, 'value') },
      { label: 'Home office reference number', value: getValueByType('HOREF', identifierData, 'value') },
      { label: 'Driving licence number', value: getValueByType('DL', identifierData, 'value') },
    ],
    aliases:
      aliasesData &&
      aliasesData.map(alias => ({
        label: putLastNameFirst(alias.firstName, alias.lastName),
        value: alias.dob && moment(alias.dob).format('DD/MM/YYYY'),
      })),
    physicalCharacteristics: [
      {
        label: 'Height',
        value: physicalAttributesData && heightMetres && `${heightMetres}m`,
      },
      {
        label: 'Weight',
        value: physicalAttributesData && weightKilograms && `${weightKilograms}kg`,
      },
      { label: 'Hair colour', value: getValueByType('HAIR', physicalCharacteristicsData, 'detail') },
      { label: 'Left eye colour', value: getValueByType('L_EYE_C', physicalCharacteristicsData, 'detail') },
      { label: 'Right eye colour', value: getValueByType('R_EYE_C', physicalCharacteristicsData, 'detail') },
      { label: 'Facial hair', value: getValueByType('FACIAL_HAIR', physicalCharacteristicsData, 'detail') },
      { label: 'Shape of face', value: getValueByType('FACE', physicalCharacteristicsData, 'detail') },
      { label: 'Build', value: getValueByType('BUILD', physicalCharacteristicsData, 'detail') },
      { label: 'Shoe size', value: getValueByType('SHOESIZE', physicalCharacteristicsData, 'detail') },
    ],
  })
}
