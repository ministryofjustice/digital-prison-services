import moment from 'moment'

import { putLastNameFirst, hasLength, formatName, getNamesFromString, formatLocation } from '../utils'

import { alertFlagLabels, profileAlertCodes } from '../shared/alertFlagValues'
import { csraTranslations } from '../shared/csraHelpers'
import config from '../config'
import logErrorAndContinue from '../shared/logErrorAndContinue'
import canAccessProbationDocuments from '../shared/probationDocumentsAccess'

const enum NeurodivergenceType {
  NoidentifiedNeurodiversityNeed = 'No identified Neurodiversity Need',
  NoidentifiedSupportRequired = 'No identified Support Required',
}
export const isComplexityEnabledFor = (agencyId) => config.apis.complexity.enabled_prisons?.includes(agencyId)

export default ({
  prisonApi,
  keyworkerApi,
  oauthApi,
  dataComplianceApi,
  pathfinderApi,
  socApi,
  systemOauthClient,
  allocationManagerApi,
  complexityApi,
  incentivesApi,
  curiousApi,
}) => {
  const {
    apis: {
      calculateReleaseDates: { ui_url: calculateReleaseDatesUrl },
      categorisation: { ui_url: categorisationUrl },
      pathfinder: { ui_url: pathfinderUrl },
      soc: { ui_url: socUrl, enabled: socEnabled },
      useOfForce: { prisons: useOfForcePrisons, ui_url: useOfForceUrl },
    },
    app: { displayRetentionLink, esweEnabled },
  } = config

  const getPrisonerProfileData = async (context, offenderNo, username) => {
    const [currentUser, prisonerDetails] = await Promise.all([
      oauthApi.currentUser(context),
      prisonApi.getDetails(context, offenderNo, true),
    ])

    const offenderRetentionRecord =
      displayRetentionLink && (await dataComplianceApi.getOffenderRetentionRecord(context, offenderNo))

    const systemContext = await systemOauthClient.getClientCredentialsTokens(username)

    const {
      activeAlertCount,
      agencyId,
      alerts,
      assignedLivingUnit,
      bookingId,
      category,
      categoryCode,
      csraClassificationCode,
      csraClassificationDate,
      inactiveAlertCount,
      interpreterRequired,
      writtenLanguage,
      language,
      profileInformation,
      physicalAttributes,
      physicalCharacteristics,
      physicalMarks,
      age,
      birthPlace,
      dateOfBirth,
    } = prisonerDetails

    const [
      iepDetails,
      keyworkerSessions,
      userCaseloads,
      staffRoles,
      keyworkerDetails,
      userRoles,
      pathfinderDetails,
      socDetails,
      allocationManager,
      neurodivergenceData,
    ] = await Promise.all(
      [
        incentivesApi.getIepSummaryForBookingIds(context, [bookingId]),
        prisonApi.getCaseNoteSummaryByTypes(context, { type: 'KA', subType: 'KS', numMonths: 1, bookingId }),
        prisonApi.userCaseLoads(context),
        prisonApi.getStaffRoles(context, currentUser.staffId, currentUser.activeCaseLoadId),
        keyworkerApi.getKeyworkerByCaseloadAndOffenderNo(context, agencyId, offenderNo),
        oauthApi.userRoles(context),
        pathfinderApi.getPathfinderDetails(systemContext, offenderNo),
        socApi.getSocDetails(systemContext, offenderNo, socEnabled),
        allocationManagerApi.getPomByOffenderNo(context, offenderNo),
        curiousApi.getLearnerNeurodivergence(systemContext, offenderNo),
      ].map((apiCall) => logErrorAndContinue(apiCall))
    )

    const NeedNeurodivergenceSupport = (divergenceData) => {
      const hasSupportNeed =
        divergenceData &&
        divergenceData[0]?.neurodivergenceSupport &&
        divergenceData[0]?.neurodivergenceSupport?.length > 0
      if (hasSupportNeed) {
        const hasIdentifiedDivergenceSupportNeed = divergenceData.some((element) => {
          return element.neurodivergenceSupport.includes(NeurodivergenceType.NoidentifiedNeurodiversityNeed)
        })

        const hasRequiredSupport = divergenceData.some((ele) => {
          return ele.neurodivergenceSupport.includes(NeurodivergenceType.NoidentifiedSupportRequired)
        })
        return !(hasIdentifiedDivergenceSupportNeed || hasRequiredSupport)
      }
      return false
    }

    const hasDivergenceSupport = NeedNeurodivergenceSupport(neurodivergenceData)

    const prisonersActiveAlertCodes = alerts.filter((alert) => !alert.expired).map((alert) => alert.alertCode)
    const alertsToShow = alertFlagLabels.filter((alertFlag) =>
      alertFlag.alertCodes.some(
        (alert) => prisonersActiveAlertCodes.includes(alert) && profileAlertCodes.includes(alert)
      )
    )

    const canViewInactivePrisoner =
      userRoles && (userRoles as any).some((role) => role.roleCode === 'INACTIVE_BOOKINGS')
    const offenderInCaseload =
      userCaseloads && (userCaseloads as any).some((caseload) => caseload.caseLoadId === agencyId)

    const isCatToolUser = Boolean(
      userRoles &&
        (userRoles as any).some((role) =>
          [
            'CREATE_CATEGORISATION',
            'CREATE_RECATEGORISATION',
            'APPROVE_CATEGORISATION',
            'CATEGORISATION_SECURITY',
          ].includes(role.roleCode)
        )
    )

    const canViewProbationDocuments = canAccessProbationDocuments(
      userRoles as [{ roleCode: string }],
      userCaseloads as [{ caseLoadId: string }],
      agencyId
    )

    const isPathfinderUser = Boolean(
      userRoles &&
        (userRoles as any).some((role) =>
          [
            'PF_STD_PRISON',
            'PF_STD_PROBATION',
            'PF_APPROVAL',
            'PF_NATIONAL_READER',
            'PF_LOCAL_READER',
            'PF_POLICE',
            'PF_HQ',
            'PF_PSYCHOLOGIST',
          ].includes(role.roleCode)
        )
    )

    const isPathfinderReadWriteUser = Boolean(
      userRoles &&
        (userRoles as any).some((role) =>
          ['PF_STD_PRISON', 'PF_STD_PROBATION', 'PF_APPROVAL', 'PF_HQ'].includes(role.roleCode)
        )
    )

    const canViewPathfinderLink = Boolean(isPathfinderUser && pathfinderDetails)
    const useOfForceEnabledPrisons = useOfForcePrisons.split(',').map((prison) => prison.trim().toUpperCase())

    const isSocUser = Boolean(
      userRoles && (userRoles as any).some((role) => ['SOC_CUSTODY', 'SOC_COMMUNITY'].includes(role.roleCode))
    )

    const canViewSocLink = Boolean(isSocUser && socDetails)

    const complexityLevel =
      isComplexityEnabledFor(agencyId) && (await complexityApi.getComplexOffenders(systemContext, [offenderNo]))

    const isHighComplexity = Boolean(complexityLevel?.length > 0 && complexityLevel[0]?.level === 'high')

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'primary_pom' does not exist on ty... Remove this comment to see the full error message
    const pomStaff = allocationManager?.primary_pom && getNamesFromString(allocationManager.primary_pom.name).join(' ')

    const canCalculateReleaseDate =
      userRoles && (userRoles as any).some((role) => role.roleCode === 'RELEASE_DATES_CALCULATOR')

    return {
      activeAlertCount,
      agencyName: assignedLivingUnit.agencyName,
      age,
      birthPlace,
      dateOfBirth,
      alerts: alertsToShow,
      canViewProbationDocuments,
      canViewPathfinderLink,
      pathfinderProfileUrl:
        pathfinderUrl && pathfinderDetails && `${pathfinderUrl}nominal/${String((pathfinderDetails as any).id)}`,
      showPathfinderReferButton: Boolean(!pathfinderDetails && isPathfinderReadWriteUser),
      pathfinderReferUrl: pathfinderUrl && `${pathfinderUrl}refer/offender/${offenderNo}`,
      canViewSocLink: socEnabled && canViewSocLink,
      socProfileUrl: socEnabled && socUrl && socDetails && `${socUrl}nominal/${String((socDetails as any).id)}`,
      showSocReferButton: Boolean(socEnabled && !socDetails && isSocUser),
      socReferUrl: socEnabled && socUrl && `${socUrl}refer/offender/${offenderNo}`,
      calculateReleaseDatesUrl: `${calculateReleaseDatesUrl}?prisonId=${offenderNo}`,
      categorisationLink: `${categorisationUrl}${bookingId}`,
      categorisationLinkText: (isCatToolUser && 'Manage category') || (offenderInCaseload && 'View category') || '',
      category,
      categoryCode,
      csra: csraTranslations[csraClassificationCode],
      csraReviewDate: csraClassificationDate && moment(csraClassificationDate).format('DD/MM/YYYY'),
      displayRetentionLink,
      incentiveLevel: iepDetails && iepDetails[0] && iepDetails[0].iepLevel,
      keyWorkerLastSession:
        keyworkerSessions && keyworkerSessions[0] && moment(keyworkerSessions[0].latestCaseNote).format('D MMMM YYYY'),
      keyWorkerName:
        keyworkerDetails && formatName((keyworkerDetails as any).firstName, (keyworkerDetails as any).lastName),
      isHighComplexity,
      inactiveAlertCount,
      location: formatLocation(assignedLivingUnit.description),
      offenderName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
      offenderNo,
      offenderRecordRetained: offenderRetentionRecord && hasLength(offenderRetentionRecord.retentionReasons),
      showAddKeyworkerSession: staffRoles && (staffRoles as any).some((role) => role.role === 'KW'),
      showCalculateReleaseDates: offenderInCaseload && canCalculateReleaseDate,
      showReportUseOfForce: useOfForceEnabledPrisons.includes(currentUser.activeCaseLoadId),
      useOfForceUrl: `${useOfForceUrl}/report/${bookingId}/report-use-of-force`,
      userCanEdit: (canViewInactivePrisoner && ['OUT', 'TRN'].includes(agencyId)) || offenderInCaseload,
      language,
      interpreterRequired,
      writtenLanguage,
      profileInformation,
      physicalAttributes,
      physicalCharacteristics,
      physicalMarks,
      staffId: currentUser.staffId,
      staffName: currentUser.name,
      pomStaff,
      esweEnabled,
      hasDivergenceSupport,
    }
  }

  return {
    getPrisonerProfileData,
  }
}
