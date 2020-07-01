const { serviceUnavailableMessage } = require('../../common-messages')
const logErrorAndContinue = require('../../shared/logErrorAndContinue')
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
const { getPrisonOffenderManagerNames } = require('../../utils')

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
    fullPrisonerDetails,
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
      elite2Api.getPrisonerDetail(res.locals, bookingId),
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
  const activeCaseAdministrator =
    otherContacts && otherContacts.find(contact => contact.activeFlag && contact.relationship === 'CA')

  const nextOfKinsWithContact =
    activeNextOfKins &&
    (await Promise.all(
      activeNextOfKins.map(async kin => ({
        ...kin,
        ...(await personService.getPersonContactDetails(res.locals, kin.personId)),
      }))
    ))

  const activeCaseAdministratorWithContact = activeCaseAdministrator && {
    ...activeCaseAdministrator,
    ...(await personService.getPersonContactDetails(res.locals, activeCaseAdministrator.personId)),
  }

  const primaryPrisonOffenderManager = () => {
    const names = allocationManager && getPrisonOffenderManagerNames(allocationManager.primary_pom)
    return (
      allocationManager &&
      allocationManager.primary_pom &&
      names && {
        firstName: names[0],
        lastName: names[1],
        relationshipDescription: 'Prisoner Offender Manager',
        noAddressRequired: true,
      }
    )
  }

  const coworkingPrisonOffenderManager = () => {
    const names = allocationManager && getPrisonOffenderManagerNames(allocationManager.secondary_pom)
    return (
      allocationManager &&
      allocationManager.secondary_pom &&
      names && {
        firstName: names[0],
        lastName: names[1],
        relationshipDescription: 'Coworking Prisoner Offender Manager',
        noAddressRequired: true,
      }
    )
  }

  const { physicalAttributes, physicalCharacteristics, physicalMarks } = fullPrisonerDetails || {}
  const { language, writtenLanguage, interpreterRequired } = prisonerProfileData

  return res.render('prisonerProfile/prisonerPersonal/prisonerPersonal.njk', {
    prisonerProfileData,
    languages: languageViewModel({ language, writtenLanguage, interpreterRequired, secondaryLanguages }),
    aliases: aliasesViewModel({ aliases }),
    distinguishingMarks: distinguishingMarksViewModel({ physicalMarks }),
    identifiers: identifiersViewModel({ identifiers }),
    personalDetails: personalDetailsViewModel({ prisonerDetails: fullPrisonerDetails, property }),
    physicalCharacteristics: physicalCharacteristicsViewModel({ physicalAttributes, physicalCharacteristics }),
    activeContacts: activeContactsViewModel({
      personal: nextOfKinsWithContact,
      professional: [
        ...(activeCaseAdministratorWithContact ? [activeCaseAdministratorWithContact] : []),
        ...(primaryPrisonOffenderManager() ? [primaryPrisonOffenderManager()] : []),
        ...(coworkingPrisonOffenderManager() ? [coworkingPrisonOffenderManager()] : []),
      ],
    }),
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
