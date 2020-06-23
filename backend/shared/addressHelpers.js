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
    { label: 'Address', value: streetWithNumber.join(', ') },
    { label: 'Town', value: address.town },
    ...(address.county ? [{ label: 'County', value: address.county }] : []),
    { label: 'Postcode', value: address.postalCode },
    ...(address.country ? [{ label: 'Country', value: address.country }] : []),
    { label: phoneLabel, value: getPhone(address.phones), useHtml: true },
    ...(showType ? [{ label: 'Address type', value: address.addressType && capitalize(address.addressType) }] : []),
  ]
}

module.exports = {
  getPhone,
  getAddress,
}
