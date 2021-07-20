// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'capitalize... Remove this comment to see the full error message
const { capitalize } = require('../utils')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getPhone'.
const getPhone = (phones) =>
  phones &&
  phones
    .map((phone) => {
      const { ext, number } = phone
      if (ext) {
        return `${number} extension number ${ext}`
      }

      return number
    })
    .join(',<br>')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getAddress... Remove this comment to see the full error message
const getAddress = ({ address = {}, showType = true, phoneLabel = 'Address phone' }) => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'flat' does not exist on type '{}'.
  const flat = address.flat && `Flat ${address.flat}`
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'premise' does not exist on type '{}'.
  const streetWithNumber = [flat, address.premise, address.street].filter((value) => value)

  return [
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type '{}'.
    { label: address.label || 'Address', value: streetWithNumber.join(', ') },
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'town' does not exist on type '{}'.
    { label: 'Town', value: address.town },
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'county' does not exist on type '{}'.
    ...(address.county ? [{ label: 'County', value: address.county }] : []),
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'postalCode' does not exist on type '{}'.
    { label: 'Postcode', value: address.postalCode },
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'country' does not exist on type '{}'.
    ...(address.country ? [{ label: 'Country', value: address.country }] : []),
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'phones' does not exist on type '{}'.
    { label: phoneLabel, html: getPhone(address.phones) },
    ...(showType
      ? [
          {
            label: 'Address type',
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'addressType' does not exist on type '{}'... Remove this comment to see the full error message
            value: address.addressType && capitalize(address.addressType.replace(' Address', '')),
          },
        ]
      : []),
  ]
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getFormatt... Remove this comment to see the full error message
const getFormattedAddress = ({ address = {} }) => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'flat' does not exist on type '{}'.
  const flat = address.flat && `Flat ${address.flat}`
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'street' does not exist on type '{}'.
  const streetWithNumber = [flat, address.street].filter((value) => value).join(', ')

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'premise' does not exist on type '{}'.
  const formattedAddress = [address.premise, streetWithNumber, address.locality, address.town, address.county]
    .filter((value) => value)
    .join('<br>')

  return [
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type '{}'.
    { label: address.label || 'Address', html: formattedAddress },
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'postalCode' does not exist on type '{}'.
    { label: 'Postcode', value: address.postalCode },
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'country' does not exist on type '{}'.
    ...(address.country ? [{ label: 'Country', value: address.country }] : []),
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'phones' does not exist on type '{}'.
    { label: 'Address phone', html: getPhone(address.phones) },
    {
      label: 'Address type',
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'addressType' does not exist on type '{}'... Remove this comment to see the full error message
      value: address.addressType && capitalize(address.addressType.replace(' Address', '')),
    },
  ]
}

module.exports = {
  getPhone,
  getAddress,
  getFormattedAddress,
}
