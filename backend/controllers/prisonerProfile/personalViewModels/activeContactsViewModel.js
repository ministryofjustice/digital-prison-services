const moment = require('moment')
const { formatName, hasLength, sortByDateTime } = require('../../../utils')
const { getPhone, getAddress } = require('../../../shared/addressHelpers')

module.exports = ({ personal, professional }) => {
  const getContactView = showEmergencyContact => contact => {
    const { phones, emails } = contact

    const activeAddresses =
      contact.addresses && contact.addresses.filter(address => !address.endDate || moment(address.endDate).isAfter())

    const address =
      activeAddresses &&
      (activeAddresses.find(contactAddress => contactAddress.primary) ||
        (activeAddresses
          .filter(
            contactAddress => contactAddress.addressType && contactAddress.addressType.toLowerCase().includes('home')
          )
          .sort((left, right) => sortByDateTime(right.startDate, left.startDate))[0] ||
          activeAddresses.sort((left, right) => sortByDateTime(right.startDate, left.startDate))[0]))

    const { noFixedAddress } = address || {}

    return {
      name: formatName(contact.firstName, contact.lastName),
      ...(showEmergencyContact ? { emergencyContact: contact.emergencyContact } : {}),
      noFixedAddress,
      details: [
        { label: 'Relationship', value: contact.relationshipDescription },
        ...(hasLength(phones) ? [{ label: 'Phone number', html: getPhone(phones) }] : []),
        ...(hasLength(emails) ? [{ label: 'Email', value: emails.map(email => email.email).join(', ') }] : []),
        ...(!contact.noAddressRequired && !noFixedAddress ? getAddress({ address }) : []),
      ],
    }
  }

  return {
    personalContacts: personal && personal.map(getContactView(true)),
    professionalContacts: professional && professional.map(getContactView(false)),
  }
}
