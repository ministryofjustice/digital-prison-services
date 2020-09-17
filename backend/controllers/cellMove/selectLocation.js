const { serviceUnavailableMessage } = require('../../common-messages')
const { alertFlagLabels, cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst } = require('../../utils')
const { showNonAssociationsLink, showCsraLink, userHasAccess } = require('./cellMoveUtils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ oauthApi, elite2Api, whereaboutsApi, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const [userCaseLoads, userRoles] = await Promise.all([
      elite2Api.userCaseLoads(res.locals),
      oauthApi.userRoles(res.locals),
    ])
    const prisonerDetails = await elite2Api.getDetails(res.locals, offenderNo, true)

    if (!userHasAccess({ userRoles, userCaseLoads, offenderCaseload: prisonerDetails.agencyId })) {
      return res.render('notFound.njk', { url: '/prisoner-search' })
    }

    const nonAssociations = await elite2Api.getNonAssociations(res.locals, prisonerDetails.bookingId)
    const cellAttributesData = await elite2Api.getCellAttributes(res.locals)
    const locationsData = await whereaboutsApi.searchGroups(res.locals, prisonerDetails.agencyId)

    const locations = locationsData.map(location => ({ text: location.name, value: location.key }))
    locations.unshift({ text: 'All locations', value: 'ALL' })
    locations.unshift({ text: 'Select residential unit', value: 'ALL' })
    const cellAttributes = cellAttributesData
      .filter(cellAttribute => cellAttribute.activeFlag === 'Y')
      .map(cellAttribute => ({ text: cellAttribute.description, value: cellAttribute.code }))

    const prisonersActiveAlertCodes = prisonerDetails.alerts
      .filter(alert => !alert.expired)
      .map(alert => alert.alertCode)
    const alertsToShow = alertFlagLabels.filter(alertFlag =>
      alertFlag.alertCodes.some(
        alert => prisonersActiveAlertCodes.includes(alert) && cellMoveAlertCodes.includes(alert)
      )
    )

    return res.render('cellMove/selectLocation.njk', {
      breadcrumbPrisonerName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
      showNonAssociationsLink:
        nonAssociations && showNonAssociationsLink(nonAssociations, prisonerDetails.assignedLivingUnit),
      showCsraLink: prisonerDetails.assessments && showCsraLink(prisonerDetails.assessments),
      alerts: alertsToShow,
      locations,
      cellAttributes,
      prisonerDetails,
      offenderNo,
      dpsUrl,
      nonAssociationLink: `/prisoner/${offenderNo}/cell-move/non-associations`,
      selectLocationRootUrl: `/prisoner/${offenderNo}/cell-move/select-location`,
      offenderDetailsUrl: `/prisoner/${offenderNo}/cell-move/offender-details`,
      csraDetailsUrl: `/prisoner/${offenderNo}/cell-move/cell-sharing-risk-assessment-details`,
      formAction: `/prisoner/${offenderNo}/cell-move/select-cell`,
      profileUrl: `/prisoner/${offenderNo}`,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-location`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
