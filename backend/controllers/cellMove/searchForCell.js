const { serviceUnavailableMessage } = require('../../common-messages')
const { alertFlagLabels, cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst, formatName } = require('../../utils')
const {
  userHasAccess,
  getNonAssocationsInEstablishment,
  renderLocationOptions,
  cellAttributes,
} = require('./cellMoveUtils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ oauthApi, prisonApi, whereaboutsApi, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const [userCaseLoads, userRoles] = await Promise.all([
      prisonApi.userCaseLoads(res.locals),
      oauthApi.userRoles(res.locals),
    ])
    const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo, true)

    if (!userHasAccess({ userRoles, userCaseLoads, offenderCaseload: prisonerDetails.agencyId })) {
      return res.render('notFound.njk', { url: '/prisoner-search' })
    }

    const nonAssociations = await prisonApi.getNonAssociations(res.locals, prisonerDetails.bookingId)
    const locationsData = await whereaboutsApi.searchGroups(res.locals, prisonerDetails.agencyId)

    const prisonersActiveAlertCodes = prisonerDetails.alerts
      .filter(alert => !alert.expired)
      .map(alert => alert.alertCode)
    const alertsToShow = alertFlagLabels.filter(alertFlag =>
      alertFlag.alertCodes.some(
        alert => prisonersActiveAlertCodes.includes(alert) && cellMoveAlertCodes.includes(alert)
      )
    )
    const numberOfNonAssociations = getNonAssocationsInEstablishment(nonAssociations).length

    return res.render('cellMove/searchForCell.njk', {
      breadcrumbPrisonerName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
      prisonerName: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
      numberOfNonAssociations,
      showNonAssociationsLink: numberOfNonAssociations > 0,
      alerts: alertsToShow,
      locations: renderLocationOptions(locationsData),
      cellAttributes,
      prisonerDetails,
      offenderNo,
      dpsUrl,
      nonAssociationLink: `/prisoner/${offenderNo}/cell-move/non-associations`,
      searchForCellRootUrl: `/prisoner/${offenderNo}/cell-move/search-for-cell`,
      offenderDetailsUrl: `/prisoner/${offenderNo}/cell-move/offender-details`,
      csraDetailsUrl: `/prisoner/${offenderNo}/cell-move/cell-sharing-risk-assessment-details`,
      formAction: `/prisoner/${offenderNo}/cell-move/select-cell`,
      profileUrl: `/prisoner/${offenderNo}`,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    res.status(500)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/search-for-cell`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
