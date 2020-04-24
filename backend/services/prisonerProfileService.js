const moment = require('moment')
const { properCaseName } = require('../utils')
const alertFlagValues = require('../shared/alertFlagValues')
const {
  apis: {
    categorisation: { ui_url: categorisationUrl },
    useOfForce: { prisons: useOfForcePrisons, ui_url: useOfForceUrl },
  },
  app: { notmEndpointUrl },
} = require('../config')
const logErrorAndContinue = require('../shared/logErrorAndContinue')

module.exports = (elite2Api, keyworkerApi, oauthApi) => {
  const getPrisonerProfileData = async (context, offenderNo) => {
    const [currentUser, prisonerDetails] = await Promise.all([
      oauthApi.currentUser(context),
      elite2Api.getDetails(context, offenderNo, true),
    ])

    const {
      activeAlertCount,
      agencyId,
      alerts,
      assignedLivingUnit,
      bookingId,
      category,
      categoryCode,
      csra,
      inactiveAlertCount,
    } = prisonerDetails

    const [iepDetails, keyworkerSessions, userCaseloads, staffRoles, keyworkerDetails, userRoles] = await Promise.all(
      [
        elite2Api.getIepSummary(context, [bookingId]),
        elite2Api.getCaseNoteSummaryByTypes(context, { type: 'KA', subType: 'KS', numMonths: 1, bookingId }),
        elite2Api.userCaseLoads(context),
        elite2Api.getStaffRoles(context, currentUser.staffId, currentUser.activeCaseLoadId),
        keyworkerApi.getKeyworkerByCaseloadAndOffenderNo(context, agencyId, offenderNo),
        oauthApi.userRoles(context),
      ].map(apiCall => logErrorAndContinue(apiCall))
    )

    const prisonersActiveAlertCodes = alerts.filter(alert => !alert.expired).map(alert => alert.alertCode)
    const alertsToShow = alertFlagValues.filter(alertFlag =>
      alertFlag.alertCodes.some(alert => prisonersActiveAlertCodes.includes(alert))
    )

    const canViewInactivePrisoner = userRoles && userRoles.some(role => role.roleCode === 'INACTIVE_BOOKINGS')
    const offenderInCaseload = userCaseloads && userCaseloads.some(caseload => caseload.caseLoadId === agencyId)

    const isCatToolUser = Boolean(
      userRoles &&
        userRoles.some(role =>
          [
            'CREATE_CATEGORISATION',
            'CREATE_RECATEGORISATION',
            'APPROVE_CATEGORISATION',
            'CATEGORISATION_SECURITY',
          ].includes(role.roleCode)
        )
    )

    const useOfForceEnabledPrisons = useOfForcePrisons.split(',').map(prison => prison.trim().toUpperCase())

    return {
      activeAlertCount,
      agencyName: assignedLivingUnit.agencyName,
      alerts: alertsToShow,
      categorisationLink: `${categorisationUrl}${bookingId}`,
      categorisationLinkText: (isCatToolUser && 'Manage category') || (offenderInCaseload && 'View category') || '',
      category,
      categoryCode,
      csra,
      incentiveLevel: iepDetails && iepDetails[0] && iepDetails[0].iepLevel,
      keyWorkerLastSession:
        keyworkerSessions && keyworkerSessions[0] && moment(keyworkerSessions[0].latestCaseNote).format('DD/MM/YYYY'),
      keyWorkerName:
        keyworkerDetails &&
        `${properCaseName(keyworkerDetails.lastName)}, ${properCaseName(keyworkerDetails.firstName)}`,
      inactiveAlertCount,
      location: assignedLivingUnit.description,
      notmEndpointUrl,
      offenderName: `${properCaseName(prisonerDetails.lastName)}, ${properCaseName(prisonerDetails.firstName)}`,
      offenderNo,
      showAddKeyworkerSession: staffRoles && staffRoles.some(role => role.role === 'KW'),
      showReportUseOfForce: useOfForceEnabledPrisons.includes(currentUser.activeCaseLoadId),
      useOfForceUrl,
      userCanEdit: (canViewInactivePrisoner && ['OUT', 'TRN'].includes(agencyId)) || offenderInCaseload,
    }
  }

  return {
    getPrisonerProfileData,
  }
}
