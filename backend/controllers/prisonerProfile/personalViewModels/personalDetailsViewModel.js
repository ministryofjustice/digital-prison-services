const moment = require('moment')
const { capitalize } = require('../../../utils')
const getValueByType = require('../../../shared/getValueByType')

module.exports = ({ prisonerDetails, property }) => {
  const { age, dateOfBirth, birthPlace, profileInformation, physicalAttributes } = prisonerDetails || {}
  const { gender, ethnicity, raceCode } = physicalAttributes || {}

  const dietValue = getValueByType('DIET', profileInformation, 'resultValue')
  const domesticAbusePerpValue = capitalize(getValueByType('DOMESTIC', profileInformation, 'resultValue'))
  const domesticAbuseVictimValue = capitalize(getValueByType('DOMVIC', profileInformation, 'resultValue'))
  const listenerSuitableValue = getValueByType('LIST_SUIT', profileInformation, 'resultValue')
  const listenerRecognisedValue = getValueByType('LIST_REC', profileInformation, 'resultValue')
  const otherNationalitiesValue = getValueByType('NATIO', profileInformation, 'resultValue')
  const travelRestrictionsValue = getValueByType('TRAVEL', profileInformation, 'resultValue')
  const youthOffenderValue = getValueByType('YOUTH', profileInformation, 'resultValue')
  const dnaRequiredValue = getValueByType('DNA', profileInformation, 'resultValue')
  const socialCareNeededValue = getValueByType('PERSC', profileInformation, 'resultValue')
  const interestToImmigrationValue = getValueByType('IMM', profileInformation, 'resultValue')

  const showListenerSuitable =
    listenerSuitableValue && listenerSuitableValue !== 'No' && listenerRecognisedValue !== 'Yes'
  const showListenerRecognised =
    listenerSuitableValue === 'Yes' || (!listenerSuitableValue && listenerRecognisedValue === 'Yes')

  const needsWarning = value => (value === 'Yes' ? value : 'Needs to be warned')

  return {
    primary: [
      { label: 'Age', value: age },
      { label: 'Date of Birth', value: dateOfBirth && moment(dateOfBirth).format('DD/MM/YYYY') },
      { label: 'Place of Birth', value: birthPlace && capitalize(birthPlace) },
      { label: 'Gender', value: gender },
      { label: 'Ethnicity', value: ethnicity && raceCode && `${ethnicity} (${raceCode})` },
      { label: 'Religion or belief', value: getValueByType('RELF', profileInformation, 'resultValue') },
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
      { label: 'Interest to immigration', value: interestToImmigrationValue },
      ...(travelRestrictionsValue ? [{ label: 'Travel restrictions', value: travelRestrictionsValue }] : []),
      ...(socialCareNeededValue === 'Yes' ? [{ label: 'Social care needed', value: socialCareNeededValue }] : []),
      ...(youthOffenderValue === 'Yes' ? [{ label: 'Youth offender', value: youthOffenderValue }] : []),
      ...(dnaRequiredValue === 'Yes' ? [{ label: 'DNA required', value: dnaRequiredValue }] : []),
    ],
    receptionWarnings: [
      {
        label: 'Warned about tattooing',
        value: needsWarning(getValueByType('TAT', profileInformation, 'resultValue')),
      },
      {
        label: 'Warned not to change appearance',
        value: needsWarning(getValueByType('APPEAR', profileInformation, 'resultValue')),
      },
    ],
    listener: [
      ...(showListenerSuitable ? [{ label: 'Listener - suitable', value: listenerSuitableValue }] : []),
      ...(showListenerRecognised ? [{ label: 'Listener - recognised', value: listenerRecognisedValue }] : []),
    ],
    domesticAbuse: [
      ...(domesticAbusePerpValue === 'Yes'
        ? [{ label: 'Domestic abuse perpetrator', value: domesticAbusePerpValue }]
        : []),
      ...(domesticAbuseVictimValue === 'Yes'
        ? [{ label: 'Domestic abuse victim', value: domesticAbuseVictimValue }]
        : []),
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
