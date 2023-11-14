import moment from 'moment'

import {
  formatName,
  formatTimestampToDate,
  formatTimestampToDateTime,
  sortByDateTime,
  putLastNameFirst,
  extractLocation,
  isTemporaryLocation,
  groupBy,
  hasLength,
} from '../../utils'

export default ({ oauthApi, systemOauthClient, prisonApi, page = 0 }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    const getAgencyDetails = async (cells) =>
      Promise.all(
        cells
          .map((cell) => cell.agencyId)
          .filter((a) => a !== undefined)
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((agencyId) => prisonApi.getAgencyDetails(res.locals, agencyId))
      )

    const enrichLocationsWithAgencyLeaveDate = (locations) => {
      const locationsWithAgencyLeaveDate = []
      let previousLocationEstablishmentName = locations[0].establishment
      let previousLocationEstablishmentNameAndLeaveDate =
        previousLocationEstablishmentName + locations[0].assignmentEndDateTime
      locations.forEach((location) => {
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

    const getCellHistoryGroupedByPeriodAtAgency = (locations) => {
      const locationsWithAgencyLeaveDate = enrichLocationsWithAgencyLeaveDate(locations)
      return Object.entries(groupBy(locationsWithAgencyLeaveDate, 'establishmentWithAgencyLeaveDate')).map(
        // eslint-disable-next-line no-unused-vars
        ([key, value]) => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'slice' does not exist on type 'unknown'.
          const fromDateString = formatTimestampToDate(value.slice(-1)[0].assignmentDateTime)
          const toDateString = formatTimestampToDate(value[0].assignmentEndDateTime) || 'Unknown'

          return {
            isValidAgency: !!value[0].establishment,
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
      const userRoles = oauthApi.userRoles(res.locals)
      const agencyData = await getAgencyDetails(cells)
      const staff = await Promise.all(cells.map((cell) => prisonApi.getStaffDetails(res.locals, cell.movementMadeBy)))

      const cellData = cells.map((cell) => {
        const staffDetails = staff.find((user) => cell.movementMadeBy === user.username)
        const agencyName = cell.agencyId
        const agency = agencyData.find((agencyDetails) => agencyName === agencyDetails.agencyId)
        const agencyDescription = agency ? agency.description : null

        return {
          establishment: agencyDescription,
          location: extractLocation(cell.description, agencyName),
          isTemporaryLocation: isTemporaryLocation(cell.description),
          movedIn: cell.assignmentDateTime && formatTimestampToDateTime(cell.assignmentDateTime),
          movedOut: cell.assignmentEndDateTime && formatTimestampToDateTime(cell.assignmentEndDateTime),
          assignmentDateTime: moment(cell.assignmentDateTime).format('YYYY-MM-DDTHH:mm:ss'),
          assignmentEndDateTime: cell.assignmentEndDateTime
            ? moment(cell.assignmentEndDateTime).format('YYYY-MM-DDTHH:mm:ss')
            : undefined,
          livingUnitId: cell.livingUnitId,
          agencyId: agencyName,
          movedInBy: formatName(staffDetails.firstName, staffDetails.lastName),
        }
      })

      const systemContext = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)
      const cellDataLatestFirst = cellData.sort((left, right) =>
        sortByDateTime(right.assignmentDateTime, left.assignmentDateTime)
      )
      const currentLocation = cellDataLatestFirst.slice(0, 1)[0]
      const occupants =
        (currentLocation && (await prisonApi.getInmatesAtLocation(systemContext, currentLocation.livingUnitId, {}))) ||
        []

      const previousLocations = cellDataLatestFirst.slice(1)

      const prisonerProfileUrl = `/prisoner/${offenderNo}`

      return res.render('prisonerProfile/prisonerCellHistory.njk', {
        cellHistoryGroupedByAgency: hasLength(previousLocations)
          ? getCellHistoryGroupedByPeriodAtAgency(previousLocations)
          : [],
        currentLocation: {
          ...currentLocation,
          assignmentEndDateTime: moment().format('YYYY-MM-DDTHH:mm:ss'),
        },
        occupants: occupants
          .filter((occupant) => occupant.offenderNo !== offenderNo)
          .map((occupant) => ({
            name: putLastNameFirst(occupant.firstName, occupant.lastName),
            profileUrl: `/prisoner/${occupant.offenderNo}`,
          })),
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}`,
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        changeCellLink: `${prisonerProfileUrl}/cell-move/search-for-cell?returnUrl=${prisonerProfileUrl}`,
        canViewCellMoveButton: userRoles && userRoles.some((role) => role.roleCode === 'CELL_MOVE'),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
