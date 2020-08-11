const { capitalize } = require('../utils')

const getPhone = phones =>
  phones &&
  phones
    .map(phone => {
      const { ext, number } = phone
      if (ext) {
        return `${number} extension number ${ext}`
      }

      return number
    })
    .join(',<br>')

const getAddress = ({ address = {}, showType = true, phoneLabel = 'Address phone' }) => {
  const flat = address.flat && `Flat ${address.flat}`
  const streetWithNumber = [flat, address.premise, address.street].filter(value => value)

  return [
    { label: address.label || 'Address', value: streetWithNumber.join(', ') },
    { label: 'Town', value: address.town },
    ...(address.county ? [{ label: 'County', value: address.county }] : []),
    { label: 'Postcode', value: address.postalCode },
    ...(address.country ? [{ label: 'Country', value: address.country }] : []),
    { label: phoneLabel, html: getPhone(address.phones) },
    ...(showType
      ? [
          {
            label: 'Address type',
            value: address.addressType && capitalize(address.addressType.replace(' Address', '')),
          },
        ]
      : []),
  ]
}

const getFormattedAddress = ({ address = {} }) => {
  const flat = address.flat && `Flat ${address.flat}`
  const streetWithNumber = [flat, address.street].filter(value => value).join(', ')

  const formattedAddress = [address.premise, streetWithNumber, address.locality, address.town, address.county]
    .filter(value => value)
    .join('<br>')

  return [
    { label: address.label || 'Address', html: formattedAddress },
    { label: 'Postcode', value: address.postalCode },
    ...(address.country ? [{ label: 'Country', value: address.country }] : []),
    { label: 'Address phone', html: getPhone(address.phones) },
    {
      label: 'Address type',
      value: address.addressType && capitalize(address.addressType.replace(' Address', '')),
    },
  ]
}

module.exports = {
  getPhone,
  getAddress,
  getFormattedAddress,
}
