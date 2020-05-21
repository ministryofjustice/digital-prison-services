const { capitalize, formatName } = require('../../../utils')

module.exports = ({ personal }) => {
  const getPhone = phones => phones && phones.length > 0 && phones.map(phone => phone.number).join(', ')

  const getAddress = address => {
    return [
      { label: 'Address', value: address.street },
      { label: 'Town', value: address.town },
      ...(address.county ? [{ label: 'County', value: address.county }] : []),
      { label: 'Postcode', value: address.postalCode },
      ...(address.country ? [{ label: 'Country', value: address.country }] : []),
      { label: 'Address phone', value: getPhone(address.phones) },
      { label: 'Address type', value: address.addressType && capitalize(address.addressType) },
    ]
  }

  const personalContacts =
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
    }))

  return { personal: personalContacts, professional: [] }
}
