const { serviceUnavailableMessage } = require('../../common-messages')
const { alertFlagLabels, cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst } = require('../../utils')
const { showNonAssociationsLink, showCsraLink } = require('./cellMoveUtils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ elite2Api, whereaboutsApi, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { location, attribute } = req.query

  if (!location) {
    res.redirect(`/prisoner/${offenderNo}/cell-move/select-location?missingLocation=true`)
  }

  try {
    const prisonerDetails = await elite2Api.getDetails(res.locals, offenderNo, true)
    const nonAssociations = await elite2Api.getNonAssociations(res.locals, prisonerDetails.bookingId)
    const cellAttributesData = await elite2Api.getCellAttributes(res.locals)
    const locationsData = await whereaboutsApi.searchGroups(res.locals, prisonerDetails.agencyId)

    const locations = locationsData.map(loc => ({ text: loc.name, value: loc.key }))
    locations.unshift({ text: 'All locations', value: 'ALL' })
    const cellAttributes = cellAttributesData
      .filter(cellAttribute => 'Y'.includes(cellAttribute.activeFlag))
      .map(cellAttribute => ({ text: cellAttribute.description, value: cellAttribute.code }))

    const prisonersActiveAlertCodes = prisonerDetails.alerts
      .filter(alert => !alert.expired)
      .map(alert => alert.alertCode)
    const alertsToShow = alertFlagLabels.filter(alertFlag =>
      alertFlag.alertCodes.some(
        alert => prisonersActiveAlertCodes.includes(alert) && cellMoveAlertCodes.includes(alert)
      )
    )
    // If the location is 'ALL' we do not need to call the whereabouts API,
    // we can directly call prisonApi.
    const cells =
      location === 'ALL'
        ? await elite2Api.getCellsWithCapacity(res.locals, prisonerDetails.agencyId)
        : await whereaboutsApi.getCellsWithCapacity(res.locals, {
            agencyId: prisonerDetails.agencyId,
            groupName: location,
          })

    return res.render('cellMove/selectCell.njk', {
      breadcrumbPrisonerName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
      showNonAssociationsLink:
        nonAssociations && showNonAssociationsLink(nonAssociations, prisonerDetails.assignedLivingUnit),
      showCsraLink: prisonerDetails.assessments && showCsraLink(prisonerDetails.assessments),
      alerts: alertsToShow,
      cells,
      locations,
      cellAttributes,
      location,
      attribute,
      prisonerDetails,
      offenderNo,
      dpsUrl,
      nonAssociationLink: `/prisoner/${offenderNo}/cell-move/non-associations`,
      selectLocationRootUrl: `/prisoner/${offenderNo}/cell-move/select-location`,
      formAction: `/prisoner/${offenderNo}/cell-move/select-cell`,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-location`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
