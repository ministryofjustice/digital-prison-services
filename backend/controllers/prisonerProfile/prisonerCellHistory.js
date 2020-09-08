const { serviceUnavailableMessage } = require('../../common-messages')
const {
  formatName,
  formatTimestampToDateTime,
  possessive,
  sortByDateTime,
  putLastNameFirst,
  extractLocation,
} = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ elite2Api, logError, page = 0 }) => async (req, res) => {
  const { offenderNo } = req.params

  const getAgencyDetails = async cells => {
    return Promise.all(
      cells
        .map(cell => cell.agencyId)
        .filter((v, i, a) => a.indexOf(v) === i)
        .map(agencyId => elite2Api.getAgencyDetails(res.locals, agencyId))
    )
  }

  try {
    const { bookingId, firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)
    const { content: cells } = await elite2Api.getOffenderCellHistory(res.locals, bookingId, {
      page,
      size: 10000,
    })

    // Collect a list of the unique agencies, to remove
    // the need to make duplicate API calls
    const agencyData = await getAgencyDetails(cells)

    const currentLocation = cells.find(cell => cell.assignmentEndDateTime === undefined)
    const occupants =
      (currentLocation && (await elite2Api.getInmatesAtLocation(res.locals, currentLocation.livingUnitId, {}))) || []

    const cellData = cells
      .sort((left, right) => sortByDateTime(right.assignmentDateTime, left.assignmentDateTime))
      .filter(cell => cell.assignmentEndDateTime)
      .map(cell => {
        const agency = agencyData.find(agencyDetails => cell.agencyId === agencyDetails.agencyId)
        return {
          establishment: agency.description,
          location: extractLocation(cell.description, cell.agencyId),
          movedIn: cell.assignmentDateTime && formatTimestampToDateTime(cell.assignmentDateTime),
          movedOut: cell.assignmentEndDateTime && formatTimestampToDateTime(cell.assignmentEndDateTime),
        }
      })

    const titleWithName = `${formatName(firstName, lastName)}${possessive(lastName)} location details`

    return res.render('prisonerProfile/prisonerCellHistory.njk', {
      cellData,
      currentLocation: {
        establishment: agencyData.find(agencyDetails => currentLocation.agencyId === agencyDetails.agencyId)
          .description,
        location: extractLocation(currentLocation.description, currentLocation.agencyId),
        movedIn: currentLocation.assignmentDateTime && formatTimestampToDateTime(currentLocation.assignmentDateTime),
        assignmentDate: currentLocation.assignmentDate,
        livingUnitId: currentLocation.livingUnitId,
        agencyId: currentLocation.agencyId,
      },
      occupants: occupants.filter(occupant => occupant.offenderNo !== offenderNo).map(occupant => {
        return {
          name: putLastNameFirst(occupant.firstName, occupant.lastName),
          profileUrl: `/prisoner/${occupant.offenderNo}`,
        }
      }),
      titleWithName,
      profileUrl: `/prisoner/${offenderNo}`,
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      changeCellLink: `/prisoner/${offenderNo}/cell-move/select-location`,
      dpsUrl,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
  }
}
