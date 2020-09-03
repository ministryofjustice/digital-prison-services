const { serviceUnavailableMessage } = require('../../common-messages')
const { alertFlagLabels, cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst } = require('../../utils')
const { showNonAssociationsLink, showCsraLink } = require('./cellMoveUtils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const extractQueryParameters = query => {
  const { location, subLocation, attribute, locationId } = query

  return {
    location: location || 'ALL',
    attribute,
    subLocation,
    locationId,
  }
}
module.exports = ({ elite2Api, whereaboutsApi, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { location, subLocation, attribute, locationId } = extractQueryParameters(req.query)

  try {
    const prisonerDetails = await elite2Api.getDetails(res.locals, offenderNo, true)
    const nonAssociations = await elite2Api.getNonAssociations(res.locals, prisonerDetails.bookingId)
    const cellAttributesData = await elite2Api.getCellAttributes(res.locals)
    const locationsData = await whereaboutsApi.searchGroups(res.locals, prisonerDetails.agencyId)

    if (req.xhr) {
      return res.render('cellMove/partials/subLocationsSelect.njk', {
        subLocations:
          locationId === 'ALL'
            ? []
            : locationsData
                .find(loc => loc.key.toLowerCase() === locationId.toLowerCase())
                .children.map(loc => ({ text: loc.name, value: loc.key })),
      })
    }

    const locations = [
      { text: 'All locations', value: 'ALL' },
      ...locationsData.map(loc => ({ text: loc.name, value: loc.key })),
    ]

    const cellAttributes = cellAttributesData
      .filter(cellAttribute => 'Y'.includes(cellAttribute.activeFlag))
      .map(cellAttribute => ({ text: cellAttribute.description, value: cellAttribute.code }))

    const subLocations = (
      locationsData.find(loc => loc.key.toLowerCase() === location.toLowerCase()) || { children: [] }
    ).children

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
        ? await elite2Api.getCellsWithCapacity(res.locals, prisonerDetails.agencyId, attribute)
        : await whereaboutsApi.getCellsWithCapacity(res.locals, {
            agencyId: prisonerDetails.agencyId,
            groupName: subLocation ? `${location}_${subLocation}` : location,
            attribute,
          })

    return res.render('cellMove/selectCell.njk', {
      formValues: {
        location,
        subLocation,
        attribute,
      },
      breadcrumbPrisonerName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
      showNonAssociationsLink:
        nonAssociations && showNonAssociationsLink(nonAssociations, prisonerDetails.assignedLivingUnit),
      showCsraLink: prisonerDetails.assessments && showCsraLink(prisonerDetails.assessments),
      alerts: alertsToShow,
      cells,
      locations,
      subLocations: (subLocations && subLocations.map(loc => ({ text: loc.name, value: loc.key }))) || [],
      cellAttributes,
      prisonerDetails,
      offenderNo,
      dpsUrl,
      nonAssociationLink: `/prisoner/${offenderNo}/cell-move/non-associations`,
      offenderDetailsUrl: `/prisoner/${offenderNo}/cell-move/offender-details`,
      csraDetailsUrl: `/prisoner/${offenderNo}/cell-move/cell-sharing-risk-assessment-details`,
      selectLocationRootUrl: `/prisoner/${offenderNo}/cell-move/select-location`,
      selectCellRootUrl: `/prisoner/${offenderNo}/cell-move/select-cell`,
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
