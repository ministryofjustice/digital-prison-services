const moment = require('moment')
const { formatName } = require('../../../utils')
const { getPhone, getAddress } = require('../../../shared/addressHelpers')

module.exports = ({ personal, professional }) => {
  const contactHasActiveAddress = contact =>
    contact.addresses.find(address => !address.endDate || moment(address.endDate).isAfter())

  const hasLength = array => array && array.length > 0

  return {
    personal:
      personal &&
      personal.map(contact => {
        const { phones, emails } = contact

        return {
          name: formatName(contact.firstName, contact.lastName),
          emergencyContact: contact.emergencyContact,
          details: [
            { label: 'Relationship', value: contact.relationshipDescription },
            ...(hasLength(phones) ? [{ label: 'Phone number', value: getPhone(phones) }] : []),
            ...(hasLength(emails) ? [{ label: 'Email', value: emails.map(email => email.email).join(', ') }] : []),
            ...getAddress({ address: contact.addresses.find(address => address.primary) }),
          ],
        }
      }),
    professional:
      professional &&
      professional.filter(contactHasActiveAddress).map(contact => {
        const { phones, emails } = contact

        return {
          name: formatName(contact.firstName, contact.lastName),
          details: [
            { label: 'Relationship', value: contact.relationshipDescription },
            ...(hasLength(phones) ? [{ label: 'Phone number', value: getPhone(phones) }] : []),
            ...(hasLength(emails) ? [{ label: 'Email', value: emails.map(email => email.email).join(', ') }] : []),
            ...getAddress({
              address: contactHasActiveAddress(contact),
            }),
          ],
        }
      }),
  }
}
