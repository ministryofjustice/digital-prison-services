const moment = require('moment')
const { formatName } = require('../../../utils')
const { getPhone, getAddress } = require('../../../shared/addressHelpers')

module.exports = ({ personal, professional }) => {
  const contactHasActiveAddress = contact =>
    contact.addresses.find(address => !address.endDate || moment(address.endDate).isAfter())

  return {
    personal:
      personal &&
      personal.map(contact => ({
        name: formatName(contact.firstName, contact.lastName),
        emergencyContact: contact.emergencyContact,
        details: [
          { label: 'Relationship', value: contact.relationshipDescription },
          { label: 'Phone number', value: getPhone(contact.phones) },
          { label: 'Email', value: contact.emails && contact.emails.map(email => email.email).join(', ') },
          ...getAddress({ address: contact.addresses.find(address => address.primary) }),
        ],
      })),
    professional:
      professional &&
      professional.filter(contactHasActiveAddress).map(contact => ({
        name: formatName(contact.firstName, contact.lastName),
        details: [
          { label: 'Relationship', value: contact.relationshipDescription },
          { label: 'Phone number', value: getPhone(contact.phones) },
          { label: 'Email', value: contact.emails && contact.emails.map(email => email.email).join(', ') },
          ...getAddress({
            address: contactHasActiveAddress(contact),
          }),
        ],
      })),
  }
}
