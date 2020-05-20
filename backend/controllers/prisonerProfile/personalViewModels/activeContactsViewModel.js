module.exports = ({ personal }) => {

  const personalContacts =
    personal &&
    personal.map(contact => ({
      label: contact.type,
      details: [
        { label: 'Relationship', value: contact.relationship },
        { label: 'Phone number', value: contact.side },
        { label: 'Email', value: contact.orentiation },
        { label: 'Address', value: contact.comment },
        { label: 'Town', value: contact.comment },
        { label: 'County', value: contact.comment },
        { label: 'Postcode', value: contact.comment },
        { label: 'Country', value: contact.comment },
        { label: 'Address phone', value: contact.comment },
        { label: 'Address type', value: contact.comment },
      ],
    }))

  return [personalContacts]
}

// personal
// [
//   {
//     lastName: 'VICTETRIS',
//     firstName: 'ALVRULEMEKA',
//     contactType: 'S',
//     contactTypeDescription: 'Social/ Family',
//     relationship: 'OTHER',
//     relationshipDescription: 'Other - Social',
//     emergencyContact: true,
//     nextOfKin: true,
//     relationshipId: 6694648,
//     personId: 1674445,
//     activeFlag: true,
//     approvedVisitorFlag: false,
//     canBeContactedFlag: false,
//     awareOfChargesFlag: false,
//     contactRootOffenderId: 0,
//     bookingId: 1102484,
//     addresses: [],
//     emails: [],
//     phones: [{ number: '1', type: 'MOB' }]
//   }
// ]
