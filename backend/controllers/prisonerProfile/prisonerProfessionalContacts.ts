// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logErrorAn... Remove this comment to see the full error message
const logErrorAndContinue = require('../../shared/logErrorAndContinue')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatName... Remove this comment to see the full error message
const { formatName, putLastNameFirst, hasLength, groupBy, sortByDateTime, getNamesFromString } = require('../../utils')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getPhone'.
const { getPhone, getFormattedAddress } = require('../../shared/addressHelpers')

const getContactView = (contact) => {
  const { address, phones, emails, jobTitle } = contact

  const { noFixedAddress } = address || {}

  return {
    name: formatName(contact.firstName, contact.lastName),
    jobTitle,
    noFixedAddress,
    details: [
      { label: 'Phone number', html: getPhone(phones) },
      { label: 'Email', value: emails.map((email) => email.email).join(', ') },
      ...(!noFixedAddress ? getFormattedAddress({ address }) : []),
    ],
  }
}

const sortByPrimaryAndStartDate = (left, right) => {
  if (left.primary && !right.primary) return -1
  if (!left.primary && right.primary) return 1

  return sortByDateTime(right.startDate, left.startDate) // Most recently added first
}

module.exports =
  ({ prisonApi, personService, allocationManagerApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    const details = await prisonApi.getDetails(res.locals, offenderNo)
    const { bookingId, firstName, lastName } = details || {}

    const [contacts, allocationManager] = await Promise.all(
      [
        prisonApi.getPrisonerContacts(res.locals, bookingId),
        allocationManagerApi.getPomByOffenderNo(res.locals, offenderNo),
      ].map((apiCall) => logErrorAndContinue(apiCall))
    )

    const { otherContacts } = contacts || {}

    const activeOfficialContacts = otherContacts
      ? otherContacts.filter((contact) => contact.activeFlag && contact.contactType === 'O')
      : []

    const contactForEachAddress =
      activeOfficialContacts.length &&
      (
        await Promise.all(
          activeOfficialContacts
            .sort((left, right) => left.firstName.localeCompare(right.firstName))
            .map(async (contact) => {
              const personContactDetails = await personService.getPersonContactDetails(res.locals, contact.personId)
              const { addresses, emails, phones } = personContactDetails

              return addresses
                .filter((address) => !address.endDate || moment(address.endDate).isAfter())
                .sort(sortByPrimaryAndStartDate)
                .map((address) => ({
                  ...contact,
                  address: { ...address, label: address.primary ? 'Main address' : 'Other address' },
                  emails,
                  phones,
                }))
            })
        )
      ).flat()

    const contactsGroupedByRelationship = hasLength(contactForEachAddress)
      ? Object.entries(groupBy(contactForEachAddress, 'relationshipDescription')).map(([key, value]) => ({
          relationship: key,
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'map' does not exist on type 'unknown'.
          contacts: value.map(getContactView),
        }))
      : []

    const pomStaff =
      allocationManager &&
      Object.entries(allocationManager)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'unknown'.
        .filter(([, value]) => value.name)
        .map(([key, value]) => ({
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'unknown'.
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
      contactsGroupedByRelationship: contactsGroupedByRelationship.sort((left, right) =>
        left.relationship.localeCompare(right.relationship)
      ),
      offenderNo,
      prisonerName: formatName(firstName, lastName),
    })
  }
