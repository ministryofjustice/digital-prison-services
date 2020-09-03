const { serviceUnavailableMessage } = require('../../common-messages')
const {
  formatName,
  stripAgencyPrefix,
  formatTimestampToDateTime,
  possessive,
  sortByDateTime,
  putLastNameFirst,
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

  const extractLocation = (location, agencyId) => {
    const withoutAgency = stripAgencyPrefix(location, agencyId)
    if (withoutAgency.includes('RECP')) return 'Reception'
    if (withoutAgency.includes('CSWAP')) return 'Cell swap'
    return withoutAgency
  }

  try {
    const { bookingId, firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)
    const { content: cells } = await elite2Api.getOffenderCellHistory(res.locals, bookingId, {
      page,
      size: 10000,
    })

    const agencyData = await getAgencyDetails(cells)

    const currentLocation = cells.find(cell => cell.assignmentEndDateTime === undefined)
    const occupiers =
      (currentLocation && (await elite2Api.getInmates(res.locals, currentLocation.description, {}))) || []

    const attributes = await elite2Api.getAttributesForLocation(res.locals, currentLocation.livingUnitId)
    const isSingleOccupancy = attributes && attributes.capacity === 1

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
      },
      occupiers: occupiers.map(occupier => {
        return {
          name: putLastNameFirst(occupier.firstName, occupier.lastName),
          profileUrl: `/prisoner/${occupier.offenderNo}`,
        }
      }),
      titleWithName,
      isSingleOccupancy,
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
