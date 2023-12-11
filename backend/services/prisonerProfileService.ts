import moment from 'moment'

import { putLastNameFirst, hasLength, formatName, getNamesFromString, formatLocation } from '../utils'

import { alertFlagLabels, profileAlertCodes } from '../shared/alertFlagValues'
import { csraTranslations } from '../shared/csraHelpers'
import config from '../config'
import logErrorAndContinue from '../shared/logErrorAndContinue'
import canAccessProbationDocuments from '../shared/probationDocumentsAccess'
import { NeurodivergenceSupport } from '../api/curious/types/Enums'
import { canViewNeurodivergenceSupportData } from '../shared/neuroDivergenceHelper'

export const isComplexityEnabledFor = (agencyId: string): boolean =>
  config.apis.complexity.enabled_prisons?.includes(agencyId)

export default ({
  prisonApi,
  keyworkerApi,
  oauthApi,
  hmppsManageUsersApi,
  dataComplianceApi,
  pathfinderApi,
  socApi,
  systemOauthClient,
  allocationManagerApi,
  complexityApi,
  incentivesApi,
  curiousApi,
  offenderSearchApi,
}) => {
  const {
    apis: {
      calculateReleaseDates: { ui_url: calculateReleaseDatesUrl },
      categorisation: { ui_url: categorisationUrl },
      pathfinder: { ui_url: pathfinderUrl },
      soc: { ui_url: socUrl, enabled: socEnabled },
      useOfForce: { prisons: useOfForcePrisons, ui_url: useOfForceUrl },
    },
    app: { displayRetentionLink, esweEnabled, neurodiversityEnabledPrisons },
  } = config

  const needNeuroDivergenceSupport = (divergenceData) => {
    const divergenceSupport = divergenceData?.neurodivergenceSupport || []

    if (divergenceSupport.length) {
      const hasIdentifiedDivergenceSupportNeed = divergenceSupport.some((element) => {
        return element.includes(NeurodivergenceSupport.NoIdentifiedNeurodiversityNeed)
      })

      const hasRequiredSupport = divergenceSupport.some((ele) => {
        return ele.includes(NeurodivergenceSupport.NoIdentifiedSupportRequired)
      })
      return !(hasIdentifiedDivergenceSupportNeed || hasRequiredSupport)
    }
    return false
  }

  const getPrisonerProfileData = async (context, offenderNo, username, overrideAccess) => {
    const [currentUser, prisonerDetails] = await Promise.all([
      hmppsManageUsersApi.currentUser(context),
      prisonApi.getDetails(context, offenderNo, true),
    ])

    const offenderRetentionRecord =
      displayRetentionLink && (await dataComplianceApi.getOffenderRetentionRecord(context, offenderNo))

    const systemContext = await systemOauthClient.getClientCredentialsTokens(username)

    // TODO: Temporary measure to allow 3rd party MegaNexus time to implement caching and other techniques to their API so it can handle high volume of calls. To be refactored!
    const getNeurodivergenceSupportNeed = async (agencyId) => {
      if (canViewNeurodivergenceSupportData(agencyId, neurodiversityEnabledPrisons as string)) {
        const divergenceData = await logErrorAndContinue(
          curiousApi.getLearnerNeurodivergence(systemContext, offenderNo)
        )
        return divergenceData[0] ? needNeuroDivergenceSupport(divergenceData[0]) : false
      }
      return false
    }

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

    const userRoles = oauthApi.userRoles(context)

    const [
      iepDetails,
      keyworkerSessions,
      userCaseloads,
      staffRoles,
      keyworkerDetails,
      pathfinderDetails,
      socDetails,
      allocationManager,
      hasDivergenceSupport,
    ] = await Promise.all(
      [
        incentivesApi.getIepSummaryForBookingIds(systemContext, [bookingId]),
        prisonApi.getCaseNoteSummaryByTypes(systemContext, { type: 'KA', subType: 'KS', numMonths: 1, bookingId }),
        prisonApi.userCaseLoads(context),
        prisonApi.getStaffRoles(context, currentUser.staffId, currentUser.activeCaseLoadId),
        keyworkerApi.getKeyworkerByCaseloadAndOffenderNo(context, agencyId, offenderNo),
        pathfinderApi.getPathfinderDetails(systemContext, offenderNo),
        socApi.getSocDetails(systemContext, offenderNo, socEnabled),
        allocationManagerApi.getPomByOffenderNo(systemContext, offenderNo),
        getNeurodivergenceSupportNeed(agencyId),
      ].map((apiCall) => logErrorAndContinue(apiCall))
    )

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
            'PF_ADMIN',
            'PF_USER',
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
          ['PF_USER', 'PF_STD_PRISON', 'PF_STD_PROBATION', 'PF_APPROVAL', 'PF_HQ'].includes(role.roleCode)
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

    const getPrisonerSearchDetails = async () => {
      const response = await offenderSearchApi.getPrisonersDetails(systemContext, [offenderNo])
      const prisonerSearchDetails = response && response[0]
      return {
        hospital: prisonerSearchDetails?.dischargedHospitalDescription,
        isRestrictedPatient: prisonerSearchDetails?.restrictedPatient,
        indeterminateSentence: prisonerSearchDetails?.indeterminateSentence,
      }
    }
    const { hospital, isRestrictedPatient, indeterminateSentence } = await getPrisonerSearchDetails()

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
      location: hospital || formatLocation(assignedLivingUnit.description),
      offenderName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
      offenderNo,
      offenderRecordRetained: offenderRetentionRecord && hasLength(offenderRetentionRecord.retentionReasons),
      showAddKeyworkerSession: staffRoles && (staffRoles as any).some((role) => role.role === 'KW'),
      showCalculateReleaseDates: offenderInCaseload && canCalculateReleaseDate,
      showReportUseOfForce: useOfForceEnabledPrisons.includes(currentUser.activeCaseLoadId) && !isRestrictedPatient,
      showAddAppointment: !isRestrictedPatient,
      showCsraHistory: !isRestrictedPatient,
      showIncentiveLevelDetails: !isRestrictedPatient,
      showFinanceDetailLinks: !isRestrictedPatient,
      showScheduleDetailLink: !isRestrictedPatient,
      showIncentiveDetailLink: !isRestrictedPatient,
      showCellHistoryLink: !isRestrictedPatient,
      showWorkAndSkillsTab: !isRestrictedPatient,
      useOfForceUrl: `${useOfForceUrl}/report/${bookingId}/report-use-of-force`,
      userCanEdit:
        (canViewInactivePrisoner && ['OUT', 'TRN'].includes(agencyId)) || offenderInCaseload || overrideAccess,
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
      indeterminateSentence,
    }
  }

  return {
    getPrisonerProfileData,
  }
}
