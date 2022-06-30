import moment from 'moment'
import { alertFlagLabels, cellMoveAlertCodes } from '../../shared/alertFlagValues'

import { putLastNameFirst, hasLength, groupBy, properCaseName, formatName, formatLocation } from '../../utils'

import {
  userHasAccess,
  getNonAssocationsInEstablishment,
  renderLocationOptions,
  cellAttributes,
  translateCsra,
} from './cellMoveUtils'

const defaultSubLocationsValue = { text: 'Select area in residential unit', value: '' }
const noAreasSelectedDropDownValue = { text: 'No areas to select', value: '' }
const toDropDownValue = (entry) => ({ text: entry.name, value: entry.key })

const sortByDescription = (a, b) => a.description.localeCompare(b.description)

const sortByLatestAssessmentDateDesc = (left, right) => {
  const leftDate = moment(left.assessmentDate, 'DD/MM/YYYY')
  const rightDate = moment(right.assessmentDate, 'DD/MM/YYYY')

  if (leftDate.isBefore(rightDate)) return 1
  if (leftDate.isAfter(rightDate)) return -1

  return 0
}

const getCellOccupants = async (res, { prisonApi, activeCaseLoadId, cells, nonAssociations }) => {
  const currentCellOccupants = (
    await Promise.all(
      cells.map((cell) => cell.id).map((cellId) => prisonApi.getInmatesAtLocation(res.locals, cellId, {}))
    )
  ).flatMap((occupant) => occupant)

  if (!hasLength(currentCellOccupants)) return []

  const occupantOffenderNos = Array.from(new Set(currentCellOccupants.map((occupant) => occupant.offenderNo)))

  const occupantAlerts = await prisonApi.getAlerts(res.locals, {
    agencyId: activeCaseLoadId,
    offenderNumbers: occupantOffenderNos,
  })
  const occupantAssessments = await prisonApi.getCsraAssessments(res.locals, occupantOffenderNos)
  const assessmentsGroupedByOffenderNo = occupantAssessments ? groupBy(occupantAssessments, 'offenderNo') : []

  const cellSharingAssessments = Object.keys(assessmentsGroupedByOffenderNo)
    .map(
      (offenderNumber) =>
        assessmentsGroupedByOffenderNo[offenderNumber]
          .filter(
            (assessment) =>
              assessment && assessment.assessmentDescription && assessment.assessmentDescription.includes('CSR')
          )
          .sort(sortByLatestAssessmentDateDesc)[0]
    )
    .filter(Boolean)

  return cells.flatMap((cell) => {
    const occupants = currentCellOccupants.filter((o) => o.assignedLivingUnitId === cell.id)
    return occupants.map((occupant) => {
      const csraInfo = cellSharingAssessments.find((rating) => rating.offenderNo === occupant.offenderNo)

      const alertCodes = occupantAlerts
        .filter(
          (alert) =>
            alert.offenderNo === occupant.offenderNo && !alert.expired && cellMoveAlertCodes.includes(alert.alertCode)
        )
        .map((alert) => alert.alertCode)

      return {
        cellId: cell.id,
        name: `${properCaseName(occupant.lastName)}, ${properCaseName(occupant.firstName)}`,
        viewOffenderDetails: `/prisoner/${occupant.offenderNo}/cell-move/offender-details`,
        alerts: alertFlagLabels.filter((label) => label.alertCodes.some((code) => alertCodes.includes(code))),
        nonAssociation: Boolean(
          nonAssociations &&
            nonAssociations.nonAssociations &&
            nonAssociations.nonAssociations.find((na) => na.offenderNonAssociation.offenderNo === occupant.offenderNo)
        ),
        csra: (csraInfo && translateCsra(csraInfo.classificationCode)) || 'Not entered',
        csraDetailsUrl: `/prisoner/${occupant.offenderNo}/cell-move/cell-sharing-risk-assessment-details`,
      }
    })
  })
}

const getResidentialLevelNonAssociations = async (res, { prisonApi, nonAssociations, cellId, agencyId, location }) => {
  if (!nonAssociations || !cellId) return []

  if (!location || location === 'ALL') {
    return nonAssociations.nonAssociations.filter(
      (nonAssociation) =>
        nonAssociation.offenderNonAssociation.assignedLivingUnitDescription &&
        nonAssociation.offenderNonAssociation.assignedLivingUnitDescription.includes(agencyId)
    )
  }
  // Get the residential unit level prefix for the selected cell by traversing up the
  // parent location tree
  const locationDetail = await prisonApi.getLocation(res.locals, cellId)
  const parentLocationDetail = await prisonApi.getLocation(res.locals, locationDetail.parentLocationId)
  const { locationPrefix } = await prisonApi.getLocation(res.locals, parentLocationDetail.parentLocationId)

  return nonAssociations.nonAssociations.filter(
    (nonAssociation) =>
      nonAssociation.offenderNonAssociation.assignedLivingUnitDescription &&
      nonAssociation.offenderNonAssociation.assignedLivingUnitDescription.includes(locationPrefix)
  )
}

export default ({ oauthApi, prisonApi, whereaboutsApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const { location = 'ALL', subLocation, cellType, locationId } = req.query
    const { activeCaseLoadId } = req.session.userDetails

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

      if (req.xhr) {
        return res.render('cellMove/partials/subLocationsSelect.njk', {
          subLocations:
            locationId === 'ALL'
              ? [noAreasSelectedDropDownValue]
              : [
                  defaultSubLocationsValue,
                  ...locationsData
                    .find((loc) => loc.key.toLowerCase() === locationId.toLowerCase())
                    .children.map(toDropDownValue),
                ],
        })
      }

      const subLocations =
        location === 'ALL'
          ? [noAreasSelectedDropDownValue]
          : [
              defaultSubLocationsValue,
              ...(
                locationsData.find((loc) => loc.key.toLowerCase() === location.toLowerCase()) || { children: [] }
              ).children.map(toDropDownValue),
            ]

      const prisonersActiveAlertCodes = prisonerDetails.alerts
        .filter((alert) => !alert.expired)
        .map((alert) => alert.alertCode)

      const alertsToShow = alertFlagLabels.filter((alertFlag) =>
        alertFlag.alertCodes.some(
          (alert) => prisonersActiveAlertCodes.includes(alert) && cellMoveAlertCodes.includes(alert)
        )
      )

      // If the location is 'ALL' we do not need to call the whereabouts API,
      // we can directly call prisonApi.
      const cells =
        location === 'ALL'
          ? await prisonApi.getCellsWithCapacity(res.locals, prisonerDetails.agencyId)
          : await whereaboutsApi.getCellsWithCapacity(res.locals, {
              agencyId: prisonerDetails.agencyId,
              groupName: subLocation ? `${location}_${subLocation}` : location,
            })

      const residentialLevelNonAssociations = await getResidentialLevelNonAssociations(res, {
        prisonApi,
        nonAssociations,
        cellId: hasLength(cells) && cells[0].id,
        agencyId: prisonerDetails.agencyId,
        location,
      })

      const selectedCells = cells.filter((cell) => {
        if (cellType === 'SO') return cell.capacity === 1
        if (cellType === 'MO') return cell.capacity > 1
        return cell
      })

      const cellOccupants = await getCellOccupants(res, {
        activeCaseLoadId,
        prisonApi,
        cells: selectedCells,
        nonAssociations,
      })

      const numberOfNonAssociations = getNonAssocationsInEstablishment(nonAssociations).length

      const prisonerDetailsWithFormattedLocation = {
        ...prisonerDetails,
        assignedLivingUnit: {
          ...prisonerDetails.assignedLivingUnit,
          description: formatLocation(prisonerDetails?.assignedLivingUnit?.description),
        },
      }

      return res.render('cellMove/selectCell.njk', {
        formValues: {
          location,
          subLocation,
          cellType,
        },
        breadcrumbPrisonerName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
        prisonerName: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
        numberOfNonAssociations,
        showNonAssociationsLink: numberOfNonAssociations > 0,
        alerts: alertsToShow,
        showNonAssociationWarning: Boolean(residentialLevelNonAssociations.length),
        cells: selectedCells
          ?.map((cell) => ({
            ...cell,
            occupants: cellOccupants.filter((occupant) => occupant.cellId === cell.id).filter(Boolean),
            spaces: cell.capacity - cell.noOfOccupants,
            type: hasLength(cell.attributes) && cell.attributes.sort(sortByDescription),
          }))
          .sort(sortByDescription),
        locations: renderLocationOptions(locationsData),
        subLocations,
        cellAttributes,
        prisonerDetails: prisonerDetailsWithFormattedLocation,
        offenderNo,
        nonAssociationLink: `/prisoner/${offenderNo}/cell-move/non-associations`,
        offenderDetailsUrl: `/prisoner/${offenderNo}/cell-move/offender-details`,
        csraDetailsUrl: `/prisoner/${offenderNo}/cell-move/cell-sharing-risk-assessment-details`,
        searchForCellRootUrl: `/prisoner/${offenderNo}/cell-move/search-for-cell`,
        selectCellRootUrl: `/prisoner/${offenderNo}/cell-move/select-cell`,
        formAction: `/prisoner/${offenderNo}/cell-move/select-cell`,
        convertedCsra: translateCsra(prisonerDetails.csraClassificationCode),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}/cell-move/search-for-cell`
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
