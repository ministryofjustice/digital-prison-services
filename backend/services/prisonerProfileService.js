const moment = require('moment')
const { properCaseName } = require('../utils')

module.exports = (elite2Api, keyworkerApi) => {
  const getPrisonerHeader = async (context, offenderNo) => {
    const prisonerDetails = await elite2Api.getDetails(context, offenderNo, true)
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

    const [iepDetails, keyworkerSessions, keyworkerDetails] = await Promise.all([
      elite2Api.getIepSummary(context, [bookingId]),
      elite2Api.getCaseNoteSummaryByTypes(context, { type: 'KA', subType: 'KS', numMonths: 1, bookingId }),
      keyworkerApi.getKeyworkerByCaseloadAndOffenderNo(context, agencyId, offenderNo),
    ])

    return {
      activeAlertCount,
      alerts,
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
    }
  }
  return {
    getPrisonerHeader,
  }
}
