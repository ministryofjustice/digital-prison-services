import logErrorAndContinue from '../../shared/logErrorAndContinue'
import { getNamesFromString } from '../../utils'
import config from '../../config'

import {
  aliasesViewModel,
  distinguishingMarksViewModel,
  identifiersViewModel,
  personalDetailsViewModel,
  physicalCharacteristicsViewModel,
  activeContactsViewModel,
  languageViewModel,
  addressesViewModel,
  careNeedsViewModel,
} from './personalViewModels'

export default ({ prisonerProfileService, personService, prisonApi, allocationManagerApi, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const [basicPrisonerDetails, treatmentTypes, healthTypes] = await Promise.all([
      prisonApi.getDetails(res.locals, offenderNo),
      prisonApi.getTreatmentTypes(res.locals),
      prisonApi.getHealthTypes(res.locals),
    ]).then((data) => data)

    const { bookingId } = basicPrisonerDetails || {}
    const treatmentCodes = treatmentTypes && treatmentTypes.map((type) => type.code).join()
    const healthCodes = healthTypes && healthTypes.map((type) => type.code).join()

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
      neurodiversities,
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
        esweService.getNeurodiversities(offenderNo),
      ].map((apiCall) => logErrorAndContinue(apiCall))
    )

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'nextOfKin' does not exist on type '{}'.
    const { nextOfKin, otherContacts } = contacts || {}
    const activeNextOfKins = nextOfKin && nextOfKin.filter((kin) => kin.activeFlag)

    const {
      app: { neurodiversityEnabledUsernames },
    } = config
    const neuroVisibleTo = neurodiversityEnabledUsernames.split(',') || []
    const { username } = req.session.userDetails
    const displayNeurodiversity = neuroVisibleTo.includes(username)

    const nextOfKinsWithContact =
      activeNextOfKins &&
      (await Promise.all(
        activeNextOfKins.map(async (kin) => ({
          ...kin,
          ...(await personService.getPersonContactDetails(res.locals, kin.personId)),
        }))
      ))

    const professionalContacts = otherContacts
      ? otherContacts
          .filter((contact) => contact.activeFlag && contact.contactType === 'O')
          .map((contact) => ({
            firstName: contact.firstName,
            lastName: contact.lastName,
            relationshipDescription: contact.relationshipDescription,
          }))
      : []

    const prisonOffenderManager =
      allocationManager &&
      (allocationManager as any).primary_pom &&
      (allocationManager as any).primary_pom.name &&
      getNamesFromString((allocationManager as any).primary_pom.name)

    if (prisonOffenderManager) {
      professionalContacts.push({
        firstName: prisonOffenderManager[0],
        lastName: prisonOffenderManager[1],
        relationshipDescription: 'Prison Offender Manager',
      })
    }

    const coworkingPrisonOffenderManager =
      allocationManager &&
      (allocationManager as any).secondary_pom &&
      (allocationManager as any).secondary_pom.name &&
      getNamesFromString((allocationManager as any).secondary_pom.name)

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

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'physicalAttributes' does not exist on ty... Remove this comment to see the full error message
    const { physicalAttributes, physicalCharacteristics, physicalMarks } = prisonerProfileData || {}
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'language' does not exist on type '{}'.
    const { language, writtenLanguage, interpreterRequired } = prisonerProfileData
    return res.render('prisonerProfile/prisonerPersonal/prisonerPersonal.njk', {
      prisonerProfileData,
      // @ts-expect-error ts-migrate(2740) FIXME: Type '{}' is missing the following properties from... Remove this comment to see the full error message
      languages: languageViewModel({ language, writtenLanguage, interpreterRequired, secondaryLanguages }),
      aliases: aliasesViewModel({ aliases }),
      distinguishingMarks: distinguishingMarksViewModel({ physicalMarks }),
      identifiers: identifiersViewModel({ identifiers }),
      personalDetails: personalDetailsViewModel({ prisonerDetails: prisonerProfileData, property }),
      physicalCharacteristics: physicalCharacteristicsViewModel({ physicalAttributes, physicalCharacteristics }),
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ personal: [unknown, unknown, u... Remove this comment to see the full error message
      ...activeContactsViewModel({
        personal: nextOfKinsWithContact,
      }),
      professionalContacts,
      neurodiversities,
      displayNeurodiversity,
      addresses: addressesViewModel({ addresses }),
      careNeedsAndAdjustments: careNeedsViewModel({
        personalCareNeeds: careNeeds && (careNeeds as any).personalCareNeeds,
        reasonableAdjustments: adjustments && (adjustments as any).reasonableAdjustments,
        treatmentTypes,
        healthTypes,
        agencies,
      }),
    })
  }
