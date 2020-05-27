const moment = require('moment')
const { getAddress } = require('../../../shared/addressHelpers')

module.exports = ({ addresses }) => {
  const primaryAddress = addresses.find(address => address.primary)

  const formattedPrimaryAddress = {
    label: 'Primary address',
    type: primaryAddress && primaryAddress.addressType,
    noFixedAddress: primaryAddress && primaryAddress.noFixedAddress,
    noAddressMessage: !primaryAddress && 'No active, primary address entered',
    details: primaryAddress && [
      ...getAddress(primaryAddress, false),
      { label: 'Added', value: primaryAddress.startDate && moment(primaryAddress.startDate).format('MMMM YYYY') },
      ...(primaryAddress.comment ? [{ label: 'Comments', value: primaryAddress.comment }] : []),
    ],
  }

  return [formattedPrimaryAddress]
}
