const moment = require('moment')
const { formatName, hasLength } = require('../../../utils')
const { getPhone, getAddress } = require('../../../shared/addressHelpers')

module.exports = ({ personal, professional }) => {
  const contactHasActiveAddress = contact =>
    contact.addresses.find(address => !address.endDate || moment(address.endDate).isAfter())

  const getContactView = (useActiveAddress, showEmergencyContact) => contact => {
    const { phones, emails } = contact
    const address = useActiveAddress
      ? contactHasActiveAddress(contact)
      : contact.addresses.find(contactAddress => contactAddress.primary)

    return {
      name: formatName(contact.firstName, contact.lastName),
      ...(showEmergencyContact ? { emergencyContact: contact.emergencyContact } : {}),
      details: [
        { label: 'Relationship', value: contact.relationshipDescription },
        ...(hasLength(phones) ? [{ label: 'Phone number', value: getPhone(phones), useHtml: true }] : []),
        ...(hasLength(emails) ? [{ label: 'Email', value: emails.map(email => email.email).join(', ') }] : []),
        ...getAddress({ address }),
      ],
    }
  }

  return {
    personal: personal && personal.map(getContactView(false, true)),
    professional: professional && professional.filter(contactHasActiveAddress).map(getContactView(true, false)),
  }
}
