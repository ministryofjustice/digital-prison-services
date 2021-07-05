const moment = require('moment')
const { putLastNameFirst, hasLength, formatName, getNamesFromString, formatLocation } = require('../utils')
const { alertFlagLabels, profileAlertCodes } = require('../shared/alertFlagValues')
const { csraTranslations } = require('../shared/csraHelpers')
const {
  apis: {
    categorisation: { ui_url: categorisationUrl },
    pathfinder: { ui_url: pathfinderUrl },
    soc: { url: socUrl, enabled: socEnabled },
    useOfForce: { prisons: useOfForcePrisons, ui_url: useOfForceUrl },
    complexity,
  },
  app: { displayRetentionLink, esweEnabled },
} = require('../config')
const logErrorAndContinue = require('../shared/logErrorAndContinue')

const isComplexityEnabledFor = (agencyId) => complexity.enabled_prisons?.includes(agencyId)

module.exports = ({
  prisonApi,
  keyworkerApi,
  oauthApi,
  dataComplianceApi,
  pathfinderApi,
  socApi,
  systemOauthClient,
  allocationManagerApi,
  complexityApi,
}) => {
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
    ] = await Promise.all(
      [
        prisonApi.getIepSummary(context, [bookingId]),
        prisonApi.getCaseNoteSummaryByTypes(context, { type: 'KA', subType: 'KS', numMonths: 1, bookingId }),
        prisonApi.userCaseLoads(context),
        prisonApi.getStaffRoles(context, currentUser.staffId, currentUser.activeCaseLoadId),
        keyworkerApi.getKeyworkerByCaseloadAndOffenderNo(context, agencyId, offenderNo),
        oauthApi.userRoles(context),
        pathfinderApi.getPathfinderDetails(systemContext, offenderNo),
        socApi.getSocDetails(systemContext, offenderNo, socEnabled),
        allocationManagerApi.getPomByOffenderNo(context, offenderNo),
      ].map((apiCall) => logErrorAndContinue(apiCall))
    )

    const prisonersActiveAlertCodes = alerts.filter((alert) => !alert.expired).map((alert) => alert.alertCode)
    const alertsToShow = alertFlagLabels.filter((alertFlag) =>
      alertFlag.alertCodes.some(
        (alert) => prisonersActiveAlertCodes.includes(alert) && profileAlertCodes.includes(alert)
      )
    )

    const canViewInactivePrisoner = userRoles && userRoles.some((role) => role.roleCode === 'INACTIVE_BOOKINGS')
    const offenderInCaseload = userCaseloads && userCaseloads.some((caseload) => caseload.caseLoadId === agencyId)

    const isCatToolUser = Boolean(
      userRoles &&
        userRoles.some((role) =>
          [
            'CREATE_CATEGORISATION',
            'CREATE_RECATEGORISATION',
            'APPROVE_CATEGORISATION',
            'CATEGORISATION_SECURITY',
          ].includes(role.roleCode)
        )
    )

    const canViewProbationDocuments = Boolean(
      userRoles && userRoles.some((role) => ['VIEW_PROBATION_DOCUMENTS', 'POM'].includes(role.roleCode))
    )

    const isPathfinderUser = Boolean(
      userRoles &&
        userRoles.some((role) =>
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
        userRoles.some((role) => ['PF_STD_PRISON', 'PF_STD_PROBATION', 'PF_APPROVAL', 'PF_HQ'].includes(role.roleCode))
    )

    const canViewPathfinderLink = Boolean(isPathfinderUser && pathfinderDetails)
    const useOfForceEnabledPrisons = useOfForcePrisons.split(',').map((prison) => prison.trim().toUpperCase())

    const isSocUser = Boolean(
      userRoles && userRoles.some((role) => ['SOC_CUSTODY', 'SOC_COMMUNITY'].includes(role.roleCode))
    )

    const canViewSocLink = Boolean(isSocUser && socDetails)

    const complexityLevel =
      isComplexityEnabledFor(agencyId) && (await complexityApi.getComplexOffenders(systemContext, [offenderNo]))

    const isHighComplexity = Boolean(complexityLevel?.length > 0 && complexityLevel[0]?.level === 'high')

    const pomStaff = allocationManager?.primary_pom && getNamesFromString(allocationManager.primary_pom.name).join(' ')

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
        pathfinderUrl && pathfinderDetails && `${pathfinderUrl}nominal/${String(pathfinderDetails.id)}`,
      showPathfinderReferButton: Boolean(!pathfinderDetails && isPathfinderReadWriteUser),
      pathfinderReferUrl: pathfinderUrl && `${pathfinderUrl}refer/offender/${offenderNo}`,
      canViewSocLink: socEnabled && canViewSocLink,
      socProfileUrl: socEnabled && socUrl && socDetails && `${socUrl}/nominal/${String(socDetails.id)}`,
      showSocReferButton: Boolean(socEnabled && !socDetails && isSocUser),
      socReferUrl: socEnabled && socUrl && `${socUrl}/refer/offender/${offenderNo}`,
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
      keyWorkerName: keyworkerDetails && formatName(keyworkerDetails.firstName, keyworkerDetails.lastName),
      isHighComplexity,
      inactiveAlertCount,
      location: formatLocation(assignedLivingUnit.description),
      offenderName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
      offenderNo,
      offenderRecordRetained: offenderRetentionRecord && hasLength(offenderRetentionRecord.retentionReasons),
      showAddKeyworkerSession: staffRoles && staffRoles.some((role) => role.role === 'KW'),
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
    }
  }

  return {
    getPrisonerProfileData,
  }
}
