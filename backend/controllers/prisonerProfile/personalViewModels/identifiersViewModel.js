const getValueByType = require('../../../shared/getValueByType')

module.exports = ({ identifiers }) => {
  const croValue = getValueByType('CRO', identifiers, 'value')
  const ninoValue = getValueByType('NINO', identifiers, 'value')
  const horefValue = getValueByType('HOREF', identifiers, 'value')
  const drivingLicenceValue = getValueByType('DL', identifiers, 'value')

  return [
    { label: 'PNC number', value: getValueByType('PNC', identifiers, 'value') },
    ...(croValue ? [{ label: 'CRO number', value: croValue }] : []),
    ...(ninoValue ? [{ label: 'National insurance number', value: ninoValue }] : []),
    ...(horefValue ? [{ label: 'Home office reference number', value: horefValue }] : []),
    ...(drivingLicenceValue ? [{ label: 'Driving licence number', value: drivingLicenceValue }] : []),
  ]
}
