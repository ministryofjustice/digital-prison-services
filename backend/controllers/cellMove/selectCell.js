const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { alertFlagLabels, cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst, hasLength, groupBy, properCaseName } = require('../../utils')
const { showNonAssociationsLink, showCsraLink, userHasAccess } = require('./cellMoveUtils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const defaultSubLocationsValue = { text: 'Select area in residential unit', value: '' }
const noAreasSelectedDropDownValue = { text: 'No areas to select', value: '' }
const toDropDownValue = entry => ({ text: entry.name, value: entry.key })

const extractQueryParameters = query => {
  const { location, subLocation, attribute, locationId } = query

  return {
    location: location || 'ALL',
    attribute,
    subLocation,
    locationId,
  }
}
const sortByDescription = (a, b) => a.description.localeCompare(b.description)

const sortByLatestAssessmentDateDesc = (left, right) => {
  const leftDate = moment(left.assessmentDate, 'DD/MM/YYYY')
  const rightDate = moment(right.assessmentDate, 'DD/MM/YYYY')

  if (leftDate.isBefore(rightDate)) return 1
  if (leftDate.isAfter(rightDate)) return -1

  return 0
}

const getCellOccupants = async (res, { elite2Api, activeCaseLoadId, cells, nonAssociations }) => {
  const currentCellOccupants = (await Promise.all(
    cells.map(cell => cell.id).map(cellId => elite2Api.getInmatesAtLocation(res.locals, cellId, {}))
  )).flatMap(occupant => occupant)

  if (!hasLength(currentCellOccupants)) return []

  const occupantOffenderNos = Array.from(new Set(currentCellOccupants.map(occupant => occupant.offenderNo)))

  const occupantAlerts = await elite2Api.getAlerts(res.locals, {
    agencyId: activeCaseLoadId,
    offenderNumbers: occupantOffenderNos,
  })

  const occupantAssessments = await elite2Api.getCsraAssessments(res.locals, occupantOffenderNos)
  const assessmentsGroupedByOffenderNo = occupantAssessments ? groupBy(occupantAssessments, 'offenderNo') : []

  const cellSharingAssessments = Object.keys(assessmentsGroupedByOffenderNo)
    .map(
      offenderNumber =>
        assessmentsGroupedByOffenderNo[offenderNumber]
          .filter(
            assessment =>
              assessment && assessment.assessmentDescription && assessment.assessmentDescription.includes('CSR')
          )
          .sort(sortByLatestAssessmentDateDesc)[0]
    )
    .filter(Boolean)

  return cells.flatMap(cell => {
    const occupants = currentCellOccupants.filter(o => o.assignedLivingUnitId === cell.id)
    return occupants.map(occupant => {
      const csraInfo = cellSharingAssessments.find(rating => rating.offenderNo === occupant.offenderNo)

      const alertCodes = occupantAlerts
        .filter(
          alert =>
            alert.offenderNo === occupant.offenderNo && !alert.expired && cellMoveAlertCodes.includes(alert.alertCode)
        )
        .map(alert => alert.alertCode)

      return {
        cellId: cell.id,
        name: `${properCaseName(occupant.lastName)}, ${properCaseName(occupant.firstName)}`,
        viewOffenderDetails: `/prisoner/${occupant.offenderNo}/cell-move/offender-details`,
        alerts: alertFlagLabels.filter(label => label.alertCodes.some(code => alertCodes.includes(code))),
        nonAssociation: Boolean(
          nonAssociations &&
            nonAssociations.nonAssociations &&
            nonAssociations.nonAssociations.find(na => na.offenderNonAssociation.offenderNo === occupant.offenderNo)
        ),
        showCsraLink: showCsraLink(
          occupantAssessments.filter(assessment => assessment.offenderNo === occupant.offenderNo)
        ),
        csra: csraInfo && csraInfo.classification,
        csraDetailsUrl: `/prisoner/${occupant.offenderNo}/cell-move/cell-sharing-risk-assessment-details`,
      }
    })
  })
}

const getResidentialLevelNonAssociations = async (res, { elite2Api, nonAssociations, cellId, agencyId, location }) => {
  if (!nonAssociations || !cellId) return []

  if (!location || location === 'ALL') {
    return nonAssociations.nonAssociations.filter(
      nonAssociation =>
        nonAssociation.offenderNonAssociation.assignedLivingUnitDescription &&
        nonAssociation.offenderNonAssociation.assignedLivingUnitDescription.includes(agencyId)
    )
  }
  // Get the residential unit level prefix for the selected cell by traversing up the
  // parent location tree
  const locationDetail = await elite2Api.getLocation(res.locals, cellId)
  const parentLocationDetail = await elite2Api.getLocation(res.locals, locationDetail.parentLocationId)
  const { locationPrefix } = await elite2Api.getLocation(res.locals, parentLocationDetail.parentLocationId)

  return nonAssociations.nonAssociations.filter(
    nonAssociation =>
      nonAssociation.offenderNonAssociation.assignedLivingUnitDescription &&
      nonAssociation.offenderNonAssociation.assignedLivingUnitDescription.includes(locationPrefix)
  )
}

module.exports = ({ oauthApi, elite2Api, whereaboutsApi, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { location, subLocation, attribute, locationId } = extractQueryParameters(req.query)
  const { activeCaseLoadId } = req.session.userDetails

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

    if (req.xhr) {
      return res.render('cellMove/partials/subLocationsSelect.njk', {
        subLocations:
          locationId === 'ALL'
            ? [noAreasSelectedDropDownValue]
            : [
                defaultSubLocationsValue,
                ...locationsData
                  .find(loc => loc.key.toLowerCase() === locationId.toLowerCase())
                  .children.map(toDropDownValue),
              ],
      })
    }

    const locations = [
      { text: 'All locations', value: 'ALL' },
      ...locationsData.map(loc => ({ text: loc.name, value: loc.key })),
    ]

    const cellAttributes = cellAttributesData
      .filter(cellAttribute => 'Y'.includes(cellAttribute.activeFlag))
      .map(cellAttribute => ({ text: cellAttribute.description, value: cellAttribute.code }))

    const subLocations =
      location === 'ALL'
        ? [noAreasSelectedDropDownValue]
        : [
            defaultSubLocationsValue,
            ...(
              locationsData.find(loc => loc.key.toLowerCase() === location.toLowerCase()) || { children: [] }
            ).children.map(toDropDownValue),
          ]

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

    const residentialLevelNonAssociations = await getResidentialLevelNonAssociations(res, {
      elite2Api,
      nonAssociations,
      cellId: hasLength(cells) && cells[0].id,
      agencyId: prisonerDetails.agencyId,
      location,
    })

    const cellOccupants = await getCellOccupants(res, { activeCaseLoadId, elite2Api, cells, nonAssociations })

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
      showNonAssociationWarning: Boolean(residentialLevelNonAssociations.length),
      cells:
        hasLength(cells) &&
        cells
          .map(cell => ({
            ...cell,
            occupants: cellOccupants.filter(occupant => occupant.cellId === cell.id).filter(Boolean),
            spaces: cell.capacity - cell.noOfOccupants,
            type: hasLength(cell.attributes) && cell.attributes.sort(sortByDescription),
          }))
          .sort(sortByDescription),
      locations,
      subLocations,
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
