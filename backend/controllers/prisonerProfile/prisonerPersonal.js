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

module.exports = ({ prisonerProfileService, personService, elite2Api, logError }) => async (req, res) => {
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
      professional: [...(activeCaseAdministratorWithContact ? [activeCaseAdministratorWithContact] : [])],
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
