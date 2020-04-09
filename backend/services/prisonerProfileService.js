const moment = require('moment')
const { properCaseName } = require('../utils')
const alertFlagValues = require('../shared/alertFlagValues')
const {
  apis: {
    categorisation: { ui_url: categorisationUrl },
  },
} = require('../config')

module.exports = (elite2Api, keyworkerApi, oauthApi) => {
  const getPrisonerHeader = async (context, offenderNo) => {
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
      csra,
      inactiveAlertCount,
    } = prisonerDetails

    const [iepDetails, keyworkerSessions, userCaseloads, staffRoles, keyworkerDetails, userRoles] = await Promise.all([
      elite2Api.getIepSummary(context, [bookingId]),
      elite2Api.getCaseNoteSummaryByTypes(context, { type: 'KA', subType: 'KS', numMonths: 1, bookingId }),
      elite2Api.userCaseLoads(context),
      elite2Api.getStaffRoles(context, currentUser.staffId, currentUser.activeCaseLoadId),
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo(context, agencyId, offenderNo),
      oauthApi.userRoles(context),
    ])

    const prisonersActiveAlertCodes = alerts.filter(alert => !alert.expired).map(alert => alert.alertCode)
    const alertsToShow = alertFlagValues.filter(alertFlag =>
      alertFlag.alertCodes.some(alert => prisonersActiveAlertCodes.includes(alert))
    )

    const canViewInactivePrisoner = userRoles && userRoles.some(role => role.roleCode === 'INACTIVE_BOOKINGS')
    const offenderInCaseload = userCaseloads.some(caseload => caseload.caseLoadId === agencyId)

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

    // isUseOfForce to do

    return {
      activeAlertCount,
      alerts: alertsToShow,
      categorisationLink: `${categorisationUrl}${bookingId}`,
      categorisationLinkText: (isCatToolUser && 'Manage category') || (offenderInCaseload && 'View category') || '',
      category,
      csra,
      incentiveLevel: Boolean(iepDetails.length) && iepDetails[0].iepLevel,
      keyWorkerLastSession:
        Boolean(keyworkerSessions.length) && moment(keyworkerSessions[0].latestCaseNote).format('DD/MM/YYYY'),
      keyWorkerName:
        Boolean(keyworkerDetails) &&
        `${properCaseName(keyworkerDetails.lastName)}, ${properCaseName(keyworkerDetails.firstName)}`,
      inactiveAlertCount,
      location: assignedLivingUnit.description,
      agencyName: assignedLivingUnit.agencyName,
      offenderName: `${properCaseName(prisonerDetails.lastName)}, ${properCaseName(prisonerDetails.firstName)}`,
      offenderNo,
      showAddKeyworkerSession: staffRoles && staffRoles.some(role => role.role === 'KW'),
      userCanEdit: (canViewInactivePrisoner && ['OUT', 'TRN'].includes(agencyId)) || offenderInCaseload,
    }
  }

  return {
    getPrisonerHeader,
  }
}
