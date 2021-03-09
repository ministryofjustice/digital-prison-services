const moment = require('moment')
const {
  formatName,
  formatTimestampToDate,
  formatTimestampToDateTime,
  sortByDateTime,
  putLastNameFirst,
  extractLocation,
  groupBy,
  hasLength,
} = require('../../utils')

module.exports = ({ oauthApi, prisonApi, page = 0 }) => async (req, res) => {
  const { offenderNo } = req.params

  const getAgencyDetails = async cells => {
    return Promise.all(
      cells
        .map(cell => cell.agencyId)
        .filter((v, i, a) => a.indexOf(v) === i)
        .map(agencyId => prisonApi.getAgencyDetails(res.locals, agencyId))
    )
  }

  const enrichLocationsWithAgencyLeaveDate = locations => {
    const locationsWithAgencyLeaveDate = []
    let previousLocationEstablishmentName = locations[0].establishment
    let previousLocationEstablishmentNameAndLeaveDate =
      previousLocationEstablishmentName + locations[0].assignmentEndDateTime
    locations.forEach(location => {
      const locationEstablishmentNameAndLeaveDate =
        previousLocationEstablishmentName !== location.establishment
          ? (previousLocationEstablishmentNameAndLeaveDate = location.establishment + location.assignmentEndDateTime)
          : previousLocationEstablishmentNameAndLeaveDate
      locationsWithAgencyLeaveDate.push({
        ...location,
        establishmentWithAgencyLeaveDate: locationEstablishmentNameAndLeaveDate,
      })
      previousLocationEstablishmentName = location.establishment
      previousLocationEstablishmentNameAndLeaveDate = locationEstablishmentNameAndLeaveDate
    })
    return locationsWithAgencyLeaveDate
  }

  const getCellHistoryGroupedByPeriodAtAgency = locations => {
    const locationsWithAgencyLeaveDate = enrichLocationsWithAgencyLeaveDate(locations)
    return Object.entries(groupBy(locationsWithAgencyLeaveDate, 'establishmentWithAgencyLeaveDate')).map(
      // eslint-disable-next-line no-unused-vars
      ([key, value]) => {
        const fromDateString = formatTimestampToDate(value.slice(-1)[0].assignmentDateTime)
        const toDateString = formatTimestampToDate(value[0].assignmentEndDateTime) || 'Unknown'

        return {
          name: value[0].establishment,
          datePeriod: `from ${fromDateString} to ${toDateString}`,
          cellHistory: value,
        }
      }
    )
  }

  try {
    const { bookingId, firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)
    const { content: cells } = await prisonApi.getOffenderCellHistory(res.locals, bookingId, {
      page,
      size: 10000,
    })
    const [userRoles, agencyData] = await Promise.all([oauthApi.userRoles(res.locals), getAgencyDetails(cells)])
    const staff = await Promise.all(cells.map(cell => prisonApi.getStaffDetails(res.locals, cell.movementMadeBy)))

    const cellData = cells.map(cell => {
      const staffDetails = staff.find(user => cell.movementMadeBy === user.username)
      const agency = agencyData.find(agencyDetails => cell.agencyId === agencyDetails.agencyId)

      return {
        establishment: agency.description,
        location: extractLocation(cell.description, cell.agencyId),
        movedIn: cell.assignmentDateTime && formatTimestampToDateTime(cell.assignmentDateTime),
        movedOut: cell.assignmentEndDateTime && formatTimestampToDateTime(cell.assignmentEndDateTime),
        assignmentDateTime: moment(cell.assignmentDateTime).format('YYYY-MM-DDTHH:mm:ss'),
        assignmentEndDateTime: cell.assignmentEndDateTime
          ? moment(cell.assignmentEndDateTime).format('YYYY-MM-DDTHH:mm:ss')
          : undefined,
        livingUnitId: cell.livingUnitId,
        agencyId: cell.agencyId,
        movedInBy: formatName(staffDetails.firstName, staffDetails.lastName),
      }
    })

    const cellDataLatestFirst = cellData
      .sort((left, right) => sortByDateTime(right.assignmentDateTime, left.assignmentDateTime))
    const currentLocation = cellDataLatestFirst.slice(0, 1)[0]
    const occupants =
      (currentLocation && (await prisonApi.getInmatesAtLocation(res.locals, currentLocation.livingUnitId, {}))) || []

    const previousLocations = cellDataLatestFirst.slice(1)

    return res.render('prisonerProfile/prisonerCellHistory.njk', {
      cellHistoryGroupedByAgency: hasLength(previousLocations)
        ? getCellHistoryGroupedByPeriodAtAgency(previousLocations)
        : [],
      currentLocation: {
        ...currentLocation,
        assignmentEndDateTime: moment().format('YYYY-MM-DDTHH:mm:ss'),
      },
      occupants: occupants.filter(occupant => occupant.offenderNo !== offenderNo).map(occupant => {
        return {
          name: putLastNameFirst(occupant.firstName, occupant.lastName),
          profileUrl: `/prisoner/${occupant.offenderNo}`,
        }
      }),
      prisonerName: formatName(firstName, lastName),
      profileUrl: `/prisoner/${offenderNo}`,
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      changeCellLink: `/prisoner/${offenderNo}/cell-move/search-for-cell`,
      canViewCellMoveButton: userRoles && userRoles.some(role => role.roleCode === 'CELL_MOVE'),
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
