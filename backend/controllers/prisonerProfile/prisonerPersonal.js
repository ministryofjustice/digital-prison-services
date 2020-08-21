const { serviceUnavailableMessage } = require('../../common-messages')
const logErrorAndContinue = require('../../shared/logErrorAndContinue')
const { getNamesFromString } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const {
  aliasesViewModel,
  distinguishingMarksViewModel,
  identifiersViewModel,
  personalDetailsViewModel,
  physicalCharacteristicsViewModel,
  activeContactsViewModel,
  languageViewModel,
  addressesViewModel,
  careNeedsViewModel,
} = require('./personalViewModels')

module.exports = ({ prisonerProfileService, personService, elite2Api, allocationManagerApi, logError }) => async (
  req,
  res
) => {
  const { offenderNo } = req.params
  const [basicPrisonerDetails, treatmentTypes, healthTypes] = await Promise.all([
    elite2Api.getDetails(res.locals, offenderNo),
    elite2Api.getTreatmentTypes(res.locals),
    elite2Api.getHealthTypes(res.locals),
  ])
    .then(data => data)
    .catch(error => {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: dpsUrl })
    })
  const { bookingId } = basicPrisonerDetails || {}
  const treatmentCodes = treatmentTypes && treatmentTypes.map(type => type.code).join()
  const healthCodes = healthTypes && healthTypes.map(type => type.code).join()

  const [
    prisonerProfileData,
    identifiers,
    aliases,
    property,
    contacts,
    addresses,
    secondaryLanguages,
    careNeeds,
    adjustments,
    agencies,
    allocationManager,
  ] = await Promise.all(
    [
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getIdentifiers(res.locals, bookingId),
      elite2Api.getOffenderAliases(res.locals, bookingId),
      elite2Api.getPrisonerProperty(res.locals, bookingId),
      elite2Api.getPrisonerContacts(res.locals, bookingId),
      elite2Api.getPrisonerAddresses(res.locals, offenderNo),
      elite2Api.getSecondaryLanguages(res.locals, bookingId),
      elite2Api.getPersonalCareNeeds(res.locals, bookingId, healthCodes),
      elite2Api.getReasonableAdjustments(res.locals, bookingId, treatmentCodes),
      elite2Api.getAgencies(res.locals),
      allocationManagerApi.getPomByOffenderNo(res.locals, offenderNo),
    ].map(apiCall => logErrorAndContinue(apiCall))
  )

  const { nextOfKin, otherContacts } = contacts || {}
  const activeNextOfKins = nextOfKin && nextOfKin.filter(kin => kin.activeFlag)

  const nextOfKinsWithContact =
    activeNextOfKins &&
    (await Promise.all(
      activeNextOfKins.map(async kin => ({
        ...kin,
        ...(await personService.getPersonContactDetails(res.locals, kin.personId)),
      }))
    ))

  const professionalContacts = otherContacts
    ? otherContacts.filter(contact => contact.activeFlag && contact.contactType === 'O').map(contact => ({
        firstName: contact.firstName,
        lastName: contact.lastName,
        relationshipDescription: contact.relationshipDescription,
      }))
    : []

  const prisonOffenderManager =
    allocationManager &&
    allocationManager.primary_pom &&
    allocationManager.primary_pom.name &&
    getNamesFromString(allocationManager.primary_pom.name)

  if (prisonOffenderManager) {
    professionalContacts.push({
      firstName: prisonOffenderManager[0],
      lastName: prisonOffenderManager[1],
      relationshipDescription: 'Prison Offender Manager',
    })
  }

  const coworkingPrisonOffenderManager =
    allocationManager &&
    allocationManager.secondary_pom &&
    allocationManager.secondary_pom.name &&
    getNamesFromString(allocationManager.secondary_pom.name)

  if (coworkingPrisonOffenderManager) {
    professionalContacts.push({
      firstName: coworkingPrisonOffenderManager[0],
      lastName: coworkingPrisonOffenderManager[1],
      relationshipDescription: 'Prison Offender Manager Co-worker',
    })
  }

  professionalContacts.sort((left, right) => {
    if (left.relationshipDescription > right.relationshipDescription) return 1
    if (right.relationshipDescription > left.relationshipDescription) return -1
    if (left.firstName > right.firstName) return 1
    if (right.firstName > left.firstName) return -1
    return 0
  })

  const { physicalAttributes, physicalCharacteristics, physicalMarks } = prisonerProfileData || {}
  const { language, writtenLanguage, interpreterRequired } = prisonerProfileData

  return res.render('prisonerProfile/prisonerPersonal/prisonerPersonal.njk', {
    prisonerProfileData,
    languages: languageViewModel({ language, writtenLanguage, interpreterRequired, secondaryLanguages }),
    aliases: aliasesViewModel({ aliases }),
    distinguishingMarks: distinguishingMarksViewModel({ physicalMarks }),
    identifiers: identifiersViewModel({ identifiers }),
    personalDetails: personalDetailsViewModel({ prisonerDetails: prisonerProfileData, property }),
    physicalCharacteristics: physicalCharacteristicsViewModel({ physicalAttributes, physicalCharacteristics }),
    ...activeContactsViewModel({
      personal: nextOfKinsWithContact,
    }),
    professionalContacts,
    addresses: addressesViewModel({ addresses }),
    careNeedsAndAdjustments: careNeedsViewModel({
      personalCareNeeds: careNeeds && careNeeds.personalCareNeeds,
      reasonableAdjustments: adjustments && adjustments.reasonableAdjustments,
      treatmentTypes,
      healthTypes,
      agencies,
    }),
  })
}
