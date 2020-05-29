const { formatName } = require('../../../utils')
const { getPhone, getAddress } = require('../../../shared/addressHelpers')

module.exports = ({ personal }) => {
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
          ...getAddress(contact.addresses.find(address => address.primary)),
        ],
      })),
    professional: [],
  }
}
