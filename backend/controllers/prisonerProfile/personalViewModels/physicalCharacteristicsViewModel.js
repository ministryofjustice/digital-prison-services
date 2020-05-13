const getValueByType = require('../../../shared/getValueByType')

module.exports = ({ physicalAttributes, physicalCharacteristics }) => {
  const { heightMetres, weightKilograms } = physicalAttributes || {}

  return [
    { label: 'Height', value: physicalAttributes && heightMetres && `${heightMetres}m` },
    { label: 'Weight', value: physicalAttributes && weightKilograms && `${weightKilograms}kg` },
    { label: 'Hair colour', value: getValueByType('HAIR', physicalCharacteristics, 'detail') },
    { label: 'Left eye colour', value: getValueByType('L_EYE_C', physicalCharacteristics, 'detail') },
    { label: 'Right eye colour', value: getValueByType('R_EYE_C', physicalCharacteristics, 'detail') },
    { label: 'Facial hair', value: getValueByType('FACIAL_HAIR', physicalCharacteristics, 'detail') },
    { label: 'Shape of face', value: getValueByType('FACE', physicalCharacteristics, 'detail') },
    { label: 'Build', value: getValueByType('BUILD', physicalCharacteristics, 'detail') },
    { label: 'Shoe size', value: getValueByType('SHOESIZE', physicalCharacteristics, 'detail') },
  ]
}
