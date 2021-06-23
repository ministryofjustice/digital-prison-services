const logErrorAndContinue = require('../../shared/logErrorAndContinue')
const { getNamesFromString } = require('../../utils')
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

module.exports = ({ prisonerProfileService, personService, prisonApi, allocationManagerApi, esweService }) => async (
  req,
  res
) => {
  const { offenderNo } = req.params
  const [basicPrisonerDetails, treatmentTypes, healthTypes] = await Promise.all([
    prisonApi.getDetails(res.locals, offenderNo),
    prisonApi.getTreatmentTypes(res.locals),
    prisonApi.getHealthTypes(res.locals),
  ]).then(data => data)

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
    learnerProfiles,
  ] = await Promise.all(
    [
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      prisonApi.getIdentifiers(res.locals, bookingId),
      prisonApi.getOffenderAliases(res.locals, bookingId),
      prisonApi.getPrisonerProperty(res.locals, bookingId),
      prisonApi.getPrisonerContacts(res.locals, bookingId),
      prisonApi.getPrisonerAddresses(res.locals, offenderNo),
      prisonApi.getSecondaryLanguages(res.locals, bookingId),
      prisonApi.getPersonalCareNeeds(res.locals, bookingId, healthCodes),
      prisonApi.getReasonableAdjustments(res.locals, bookingId, treatmentCodes),
      prisonApi.getAgencies(res.locals),
      allocationManagerApi.getPomByOffenderNo(res.locals, offenderNo),
      esweService.getLearnerProfiles(offenderNo),
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
    learnerProfiles,
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
