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
        activeAddresses.sort((left, right) => sortByDateTime(right.startDate, left.startDate))[0])

    return {
      name: formatName(contact.firstName, contact.lastName),
      ...(showEmergencyContact ? { emergencyContact: contact.emergencyContact } : {}),
      details: [
        { label: 'Relationship', value: contact.relationshipDescription },
        ...(hasLength(phones) ? [{ label: 'Phone number', html: getPhone(phones) }] : []),
        ...(hasLength(emails) ? [{ label: 'Email', value: emails.map(email => email.email).join(', ') }] : []),
        ...(!contact.noAddressRequired ? getAddress({ address }) : []),
      ],
    }
  }

  return {
    personal: personal && personal.map(getContactView(true)),
    professional: professional && professional.map(getContactView(false)),
  }
}
