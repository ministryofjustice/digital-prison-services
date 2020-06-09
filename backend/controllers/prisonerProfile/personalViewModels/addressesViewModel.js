const moment = require('moment')
const { getAddress } = require('../../../shared/addressHelpers')

module.exports = ({ addresses }) => {
  const activeAddresses =
    addresses && addresses.filter(address => !address.endDate || moment(address.endDate).isAfter())
  const primaryAddress = activeAddresses && activeAddresses.find(address => address.primary)

  const { addressUsages } = primaryAddress || {}

  const formattedPrimaryAddress = {
    label: 'Primary address',
    types: addressUsages && addressUsages.filter(usage => usage.activeFlag).map(usage => usage.addressUsageDescription),
    noFixedAddress: primaryAddress && primaryAddress.noFixedAddress,
    noAddressMessage: !primaryAddress && 'No active, primary address entered',
    details: primaryAddress && [
      ...getAddress({ address: primaryAddress, showType: false, phoneLabel: 'Phone' }),
      { label: 'Added', value: primaryAddress.startDate && moment(primaryAddress.startDate).format('MMMM YYYY') },
      ...(primaryAddress.comment ? [{ label: 'Comments', value: primaryAddress.comment }] : []),
    ],
  }

  return [formattedPrimaryAddress]
}
