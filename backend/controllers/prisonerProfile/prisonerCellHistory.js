const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const {
  formatName,
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

module.exports = ({ oauthApi, prisonApi, logError, page = 0 }) => async (req, res) => {
  const { offenderNo } = req.params

  const getAgencyDetails = async cells => {
    return Promise.all(
      cells
        .map(cell => cell.agencyId)
        .filter((v, i, a) => a.indexOf(v) === i)
        .map(agencyId => prisonApi.getAgencyDetails(res.locals, agencyId))
    )
  }

  try {
    const { bookingId, firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)
    const { content: cells } = await prisonApi.getOffenderCellHistory(res.locals, bookingId, {
      page,
      size: 10000,
    })
    const userRoles = await oauthApi.userRoles(res.locals)
    const canViewCellMoveButton = userRoles && userRoles.some(role => role.roleCode === 'CELL_MOVE')

    // Collect a list of the unique agencies, to remove
    // the need to make duplicate API calls
    const agencyData = await getAgencyDetails(cells)

    const currentLocation = cells.find(cell => cell.assignmentEndDateTime === undefined)
    const occupants =
      (currentLocation && (await prisonApi.getInmatesAtLocation(res.locals, currentLocation.livingUnitId, {}))) || []

    const today = moment().format('YYYY-MM-DDTHH:mm:ss')

    const cellData = await Promise.all(
      cells
        .sort((left, right) => sortByDateTime(right.assignmentDateTime, left.assignmentDateTime))
        .filter(cell => cell.assignmentEndDateTime)
        .map(async cell => {
          const staffDetails = await prisonApi.getStaffDetails(res.locals, cell.movementMadeBy).catch(error => {
            logError(req.originalUrl, error, serviceUnavailableMessage)
            return null
          })
          const agency = agencyData.find(agencyDetails => cell.agencyId === agencyDetails.agencyId)

          return {
            establishment: agency.description,
            location: extractLocation(cell.description, cell.agencyId),
            movedIn: cell.assignmentDateTime && formatTimestampToDateTime(cell.assignmentDateTime),
            movedOut: cell.assignmentEndDateTime && formatTimestampToDateTime(cell.assignmentEndDateTime),
            assignmentDateTime: moment(cell.assignmentDateTime).format('YYYY-MM-DDTHH:mm:ss'),
            assignmentEndDateTime: cell.assignmentEndDateTime
              ? moment(cell.assignmentEndDateTime).format('YYYY-MM-DDTHH:mm:ss')
              : today,
            livingUnitId: cell.livingUnitId,
            agencyId: cell.agencyId,
            movedBy: formatName(staffDetails.firstName, staffDetails.lastName),
          }
        })
    )

    const cellHistoryGroupedByAgency = hasLength(cellData)
      ? Object.entries(groupBy(cellData, 'establishment')).map(([key, value]) => {
          const fromDateString = value[0].movedIn.split(' -')[0]
          const toDateString = value.slice(-1)[0].movedOut.split(' -')[0]

          return {
            name: key,
            datePeriod: `from ${fromDateString} to ${toDateString}`,
            cellHistory: value,
          }
        })
      : []

    return res.render('prisonerProfile/prisonerCellHistory.njk', {
      cellHistoryGroupedByAgency,
      currentLocation: {
        establishment: agencyData.find(agencyDetails => currentLocation.agencyId === agencyDetails.agencyId)
          .description,
        location: extractLocation(currentLocation.description, currentLocation.agencyId),
        movedIn: currentLocation.assignmentDateTime && formatTimestampToDateTime(currentLocation.assignmentDateTime),
        assignmentDateTime: moment(currentLocation.assignmentDateTime).format('YYYY-MM-DDTHH:mm:ss'),
        assignmentEndDateTime: currentLocation.assignmentEndDateTime
          ? moment(currentLocation.assignmentEndDate).format('YYYY-MM-DDTHH:mm:ss')
          : today,
        livingUnitId: currentLocation.livingUnitId,
        agencyId: currentLocation.agencyId,
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
      changeCellLink: `/prisoner/${offenderNo}/cell-move/select-location`,
      canViewCellMoveButton,
      dpsUrl,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
  }
}
