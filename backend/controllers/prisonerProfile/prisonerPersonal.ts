import { Request, Response } from 'express'
import logErrorAndContinue from '../../shared/logErrorAndContinue'
import { getNamesFromString } from '../../utils'
import config from '../../config'
import getContext from './prisonerProfileContext'

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

import { canViewNeurodivergenceSupportData, createFlaggedContent } from '../../shared/neuroDivergenceHelper'

export default ({
    prisonerProfileService,
    personService,
    prisonApi,
    allocationManagerApi,
    esweService,
    systemOauthClient,
    restrictedPatientApi,
    oauthApi,
  }) =>
  async (req: Request, res: Response): Promise<void> => {
    const { offenderNo, establishmentId } = req.params
    const { username } = req.session.userDetails

    const { context, overrideAccess } = await getContext({
      offenderNo,
      res,
      req,
      oauthApi,
      systemOauthClient,
      restrictedPatientApi,
    })
    // Separate call to retrieve a system token specifically to retrieve POM - we know this is safe to do as other calls failing would prevent the page loading if the user is not allowed to view the prisoner.
    const systemContext = await systemOauthClient.getClientCredentialsTokens(username)

    const [basicPrisonerDetails, treatmentTypes, healthTypes] = await Promise.all([
      prisonApi.getDetails(context, offenderNo),
      prisonApi.getTreatmentTypes(context),
      prisonApi.getHealthTypes(context),
    ]).then((data) => data)

    const { bookingId } = basicPrisonerDetails || {}
    const treatmentCodes = treatmentTypes && treatmentTypes.map((type) => type.code).join()
    const healthCodes = healthTypes && healthTypes.map((type) => type.code).join()

    const {
      app: { neurodiversityEnabledPrisons },
    } = config

    // TODO: Part of temporary measure to only allow restricted prisons access to neurodivergence data. If no prisons specified then assume all are allowed access.
    const getNeurodivergenceSupportNeed = async () => {
      let divergence = createFlaggedContent([])
      if (canViewNeurodivergenceSupportData(basicPrisonerDetails.agencyId, neurodiversityEnabledPrisons as string)) {
        divergence = await esweService.getNeurodivergence(offenderNo, establishmentId)
      }
      return divergence
    }

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
      allocationManager,
      neurodiversities,
      neurodivergence,
    ] = await Promise.all(
      [
        prisonerProfileService.getPrisonerProfileData(context, offenderNo, username, overrideAccess),
        prisonApi.getIdentifiers(context, bookingId),
        prisonApi.getOffenderAliases(context, bookingId),
        prisonApi.getPrisonerProperty(context, bookingId),
        prisonApi.getPrisonerContacts(systemContext, bookingId),
        prisonApi.getPrisonerAddresses(systemContext, offenderNo),
        prisonApi.getSecondaryLanguages(context, bookingId),
        prisonApi.getPersonalCareNeeds(context, bookingId, healthCodes),
        prisonApi.getReasonableAdjustments(context, bookingId, treatmentCodes),
        allocationManagerApi.getPomByOffenderNo(systemContext, offenderNo),
        esweService.getNeurodiversities(offenderNo),
        getNeurodivergenceSupportNeed(),
      ].map((apiCall) => logErrorAndContinue(apiCall))
    )

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'nextOfKin' does not exist on type '{}'.
    const { nextOfKin, otherContacts } = contacts || {}
    const activeNextOfKins = nextOfKin && nextOfKin.filter((kin) => kin.activeFlag)

    const displayNeurodiversity = neurodiversityEnabledPrisons?.includes(basicPrisonerDetails.agencyId)

    const nextOfKinsWithContact =
      activeNextOfKins &&
      (await Promise.all(
        activeNextOfKins.map(async (kin) => ({
          ...kin,
          ...(await personService.getPersonContactDetails(systemContext, kin.personId)),
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
      neurodivergence,
      displayNeurodiversity,
      addresses: addressesViewModel({ addresses }),
      careNeedsAndAdjustments: careNeedsViewModel({
        personalCareNeeds: careNeeds && (careNeeds as any).personalCareNeeds,
        reasonableAdjustments: adjustments && (adjustments as any).reasonableAdjustments,
        treatmentTypes,
        healthTypes,
      }),
    })
  }
