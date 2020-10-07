const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const logErrorAndContinue = require('../../shared/logErrorAndContinue')
const { formatName, putLastNameFirst, hasLength, groupBy, sortByDateTime, getNamesFromString } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { getPhone, getFormattedAddress } = require('../../shared/addressHelpers')

const getContactView = contact => {
  const { address, phones, emails, jobTitle } = contact

  const { noFixedAddress } = address || {}

  return {
    name: formatName(contact.firstName, contact.lastName),
    jobTitle,
    noFixedAddress,
    details: [
      { label: 'Phone number', html: getPhone(phones) },
      { label: 'Email', value: emails.map(email => email.email).join(', ') },
      ...(!noFixedAddress ? getFormattedAddress({ address }) : []),
    ],
  }
}

const sortByPrimaryAndStartDate = (left, right) => {
  if (left.primary && !right.primary) return -1
  if (!left.primary && right.primary) return 1

  return sortByDateTime(right.startDate, left.startDate) // Most recently added first
}

module.exports = ({ elite2Api, personService, allocationManagerApi, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const details = await elite2Api.getDetails(res.locals, offenderNo)
    const { bookingId, firstName, lastName } = details || {}

    const [contacts, allocationManager] = await Promise.all(
      [
        elite2Api.getPrisonerContacts(res.locals, bookingId),
        allocationManagerApi.getPomByOffenderNo(res.locals, offenderNo),
      ].map(apiCall => logErrorAndContinue(apiCall))
    )

    const { otherContacts } = contacts || {}

    const activeOfficialContacts = otherContacts
      ? otherContacts.filter(contact => contact.activeFlag && contact.contactType === 'O')
      : []

    const contactForEachAddress =
      activeOfficialContacts.length &&
      (await Promise.all(
        activeOfficialContacts
          .sort((left, right) => left.firstName.localeCompare(right.firstName))
          .map(async contact => {
            const personContactDetails = await personService.getPersonContactDetails(res.locals, contact.personId)
            const { addresses, emails, phones } = personContactDetails

            return addresses
              .filter(address => !address.endDate || moment(address.endDate).isAfter())
              .sort(sortByPrimaryAndStartDate)
              .map(address => ({
                ...contact,
                address: { ...address, label: address.primary ? 'Main address' : 'Other address' },
                emails,
                phones,
              }))
          })
      )).flat()

    const contactsGroupedByRelationship = hasLength(contactForEachAddress)
      ? Object.entries(groupBy(contactForEachAddress, 'relationshipDescription')).map(([key, value]) => ({
          relationship: key,
          contacts: value.map(getContactView),
        }))
      : []

    const pomStaff =
      allocationManager &&
      Object.entries(allocationManager)
        .filter(([, value]) => value.name)
        .map(([key, value]) => ({
          name: getNamesFromString(value.name).join(' '),
          jobTitle: key === 'secondary_pom' && 'Co-worker',
        }))

    if (hasLength(pomStaff)) {
      contactsGroupedByRelationship.push({
        relationship: 'Prison Offender Manager',
        contacts: pomStaff,
      })
    }

    return res.render('prisonerProfile/prisonerProfessionalContacts/prisonerProfessionalContacts.njk', {
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      dpsUrl,
      contactsGroupedByRelationship: contactsGroupedByRelationship.sort((left, right) =>
        left.relationship.localeCompare(right.relationship)
      ),
      offenderNo,
      prisonerName: formatName(firstName, lastName),
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: '/' })
  }
}
