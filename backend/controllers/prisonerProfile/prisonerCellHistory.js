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
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

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

  const getCellHistoryGroupedByPeriodAtAgency = locations => {
    let currentEstablishment = locations[0].establishment
    let currentEstablishmentWithEndDate = currentEstablishment + locations[0].assignmentEndDateTime
    const updatedLocations = []
    locations.forEach(location => {
      if (currentEstablishment !== location.establishment) {
        currentEstablishmentWithEndDate = location.establishment + location.assignmentEndDateTime
      }
      currentEstablishment = location.establishment
      updatedLocations.push({
        ...location,
        establishmentWithEndDate: currentEstablishmentWithEndDate,
      })
    })
    return Object.entries(groupBy(updatedLocations, 'establishmentWithEndDate')).map(([key, value]) => {
      const fromDateString = formatTimestampToDate(value.slice(-1)[0].assignmentDateTime)
      const toDateString = formatTimestampToDate(value[0].assignmentEndDateTime)

      return {
        name: value[0].establishment,
        datePeriod: `from ${fromDateString} to ${toDateString}`,
        cellHistory: value,
      }
    })
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

    const currentLocation = cellData.find(cell => cell.assignmentEndDateTime === undefined)
    const occupants =
      (currentLocation && (await prisonApi.getInmatesAtLocation(res.locals, currentLocation.livingUnitId, {}))) || []

    const previousLocations = cellData
      .filter(cell => cell.assignmentEndDateTime)
      .sort((left, right) => sortByDateTime(right.assignmentDateTime, left.assignmentDateTime))

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
      dpsUrl,
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
