const moment = require('moment')
const { capitalize } = require('../../../utils')
const getValueByType = require('../../../shared/getValueByType')

module.exports = ({ prisonerDetails, property }) => {
  const { age, dateOfBirth, birthPlace, profileInformation, physicalAttributes } = prisonerDetails || {}
  const { gender, ethnicity } = physicalAttributes || {}

  const dietValue = getValueByType('DIET', profileInformation, 'resultValue')
  const domesticAbusePerpValue = getValueByType('DOMESTIC', profileInformation, 'resultValue')
  const domesticAbuseVictimValue = getValueByType('DOMVIC', profileInformation, 'resultValue')
  const listenerSuitableValue = getValueByType('LIST_SUIT', profileInformation, 'resultValue')
  const listenerRecognisedValue = getValueByType('LIST_REC', profileInformation, 'resultValue')
  const otherNationalitiesValue = getValueByType('NATIO', profileInformation, 'resultValue')
  const travelRestrictionsValue = getValueByType('TRAVEL', profileInformation, 'resultValue')
  const youthOffenderValue = getValueByType('YOUTH', profileInformation, 'resultValue')
  const dnaRequiredValue = getValueByType('DNA', profileInformation, 'resultValue')
  const socialCareNeededValue = getValueByType('PERSC', profileInformation, 'resultValue')

  const showListenerSuitable =
    (listenerSuitableValue && !listenerRecognisedValue) ||
    (listenerSuitableValue === 'Yes' && listenerRecognisedValue === 'No')
  const showListenerRecognised = listenerSuitableValue === 'Yes'
  const showDomesticAbusePerp = domesticAbusePerpValue && domesticAbusePerpValue !== 'NO'
  const showDomesticAbuseVictim = domesticAbuseVictimValue && domesticAbuseVictimValue !== 'NO'

  return {
    primary: [
      { label: 'Age', value: age },
      { label: 'Date of Birth', value: dateOfBirth && moment(dateOfBirth).format('DD/MM/YYYY') },
      { label: 'Place of Birth', value: birthPlace && capitalize(birthPlace) },
      { label: 'Gender', value: gender },
      { label: 'Ethnicity', value: ethnicity },
      { label: 'Religion', value: getValueByType('RELF', profileInformation, 'resultValue') },
      { label: 'Nationality', value: getValueByType('NAT', profileInformation, 'resultValue') },
      ...(otherNationalitiesValue ? [{ label: 'Other nationalities', value: otherNationalitiesValue }] : []),
    ],
    secondary: [
      { label: 'Sexual orientation', value: getValueByType('SEXO', profileInformation, 'resultValue') },
      { label: 'Marital status', value: getValueByType('MARITAL', profileInformation, 'resultValue') },
      { label: 'Number of children', value: getValueByType('CHILD', profileInformation, 'resultValue') },
      { label: 'Smoker or vaper', value: getValueByType('SMOKE', profileInformation, 'resultValue') },
      ...(dietValue ? [{ label: 'Type of diet', value: dietValue }] : []),
    ],
    tertiary: [
      { label: 'Interest to immigration', value: getValueByType('IMM', profileInformation, 'resultValue') },
      ...(travelRestrictionsValue ? [{ label: 'Travel restrictions', value: travelRestrictionsValue }] : []),
      ...(socialCareNeededValue ? [{ label: 'Social care needed', value: socialCareNeededValue }] : []),
      ...(youthOffenderValue ? [{ label: 'Youth offender', value: youthOffenderValue }] : []),
      ...(dnaRequiredValue ? [{ label: 'DNA required', value: dnaRequiredValue }] : []),
    ],
    receptionWarnings: [
      { label: 'Warned about tatooing', value: getValueByType('TAT', profileInformation, 'resultValue') },
      { label: 'Warned not to change appearance', value: getValueByType('APPEAR', profileInformation, 'resultValue') },
    ],
    listener: [
      ...(showListenerSuitable ? [{ label: 'Listener suitable', value: listenerSuitableValue }] : []),
      ...(showListenerRecognised ? [{ label: 'Listener - recognised', value: listenerRecognisedValue }] : []),
    ],
    domesticAbuse: [
      ...(showDomesticAbusePerp ? [{ label: 'Domestic abuse perpetrator', value: domesticAbusePerpValue }] : []),
      ...(showDomesticAbuseVictim ? [{ label: 'Domestic abuse victim', value: domesticAbuseVictimValue }] : []),
    ],
    property:
      property &&
      property.map(item => ({
        label: 'Property',
        value: item.containerType,
        details: [
          { label: 'Seal mark', value: item.sealMark },
          { label: 'Location', value: item.location && item.location.userDescription },
        ],
      })),
  }
}
