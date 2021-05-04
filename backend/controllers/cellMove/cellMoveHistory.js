const moment = require('moment')

const { formatName, formatLocation, stripAgencyPrefix, putLastNameFirst } = require('../../utils.js')

const latestBedAssignment = (left, right) => right.bedAssignmentHistorySequence - left.bedAssignmentHistorySequence
const formatLocationDescription = (description, agencyId) => formatLocation(stripAgencyPrefix(description, agencyId))

const matchesLocationPrefix = (description, locationPrefix) => {
  if (locationPrefix.length > description.length) return false

  const data = description.substr(0, locationPrefix.length)
  return data === locationPrefix
}

const dateTimeFormat = 'YYYY-MM-DDTHH:mm'

const sortByMostEarliestFirst = (left, right) => {
  const leftDate = moment(left.assignmentDateTime, dateTimeFormat)
  const rightDate = moment(right.assignmentDateTime, dateTimeFormat)

  if (leftDate.isAfter(rightDate, 'minute')) return 1
  if (leftDate.isBefore(rightDate, 'minute')) return -1

  return 0
}

const prisonApiLocationDescription = async (res, whereaboutsApi, locationKey, userCaseLoad) => {
  const fullLocationPrefix = await whereaboutsApi.getAgencyGroupLocationPrefix(res.locals, userCaseLoad, locationKey)
  if (fullLocationPrefix) {
    const locationIdWithSuffix = fullLocationPrefix.locationPrefix
    return locationIdWithSuffix?.length < 1 ? '' : locationIdWithSuffix.slice(0, -1)
  }
  return `${userCaseLoad}-${locationKey}`
}

module.exports = ({ prisonApi, whereaboutsApi }) => async (req, res) => {
  if (!req?.query?.date) return res.redirect('/change-someones-cell/recent-cell-moves')

  const { date, locationId, reason } = req.query

  const {
    user: { activeCaseLoad },
  } = res.locals

  const filterByLocationPrefix =
    locationId &&
    (await prisonApiLocationDescription(res, whereaboutsApi, req.query.locationId, activeCaseLoad.caseLoadId))

  const currentUserLocations = await whereaboutsApi.searchGroups(res.locals, activeCaseLoad.caseLoadId)

  const locations = currentUserLocations.map(locationData => ({ text: locationData.name, value: locationData.key }))

  const cellMoveHistory = (await prisonApi.getHistoryByDate(res.locals, {
    assignmentDate: date,
  })).filter(
    item =>
      item.agencyId === activeCaseLoad.caseLoadId &&
      (!filterByLocationPrefix || matchesLocationPrefix(item.description, filterByLocationPrefix)) &&
      (!reason || item.assignmentReason === reason)
  )
  const usernames = [...new Set(cellMoveHistory.map(cellMove => cellMove.movementMadeBy))]
  const offenderNos = [...new Set(cellMoveHistory.map(cellMove => cellMove.offenderNo))]
  const cellMoveTypes = await prisonApi.getCellMoveReasonTypes(res.locals)

  const staffMembers = await Promise.all(usernames.map(staffId => prisonApi.getStaffDetails(res.locals, staffId)))

  const cellMoveReasons = cellMoveTypes.map(subType => ({
    value: subType.code,
    text: subType.description,
  }))

  const offenders = await prisonApi.getPrisoners(
    { ...res.locals, requestHeaders: { 'page-offset': 0, 'page-limit': offenderNos.length } },
    { offenderNos }
  )

  const bookingIds = (offenders && [...new Set(offenders.map(o => o.latestBookingId))]) || []

  const cellHistoryByOffenderNo = await Promise.all(
    bookingIds.map(bookingId =>
      prisonApi
        .getOffenderCellHistory(res.locals, bookingId, {
          page: 0,
          size: 10000,
        })
        .then(result => result.content.flatMap(history => history))
        .catch(error => {
          if (error?.response?.status === 404) return null

          throw error
        })
    )
  )

  const historyByDate = cellMoveHistory.sort(sortByMostEarliestFirst).map(history => {
    const offender = offenders.find(o => o.offenderNo === history.offenderNo)
    const staff = staffMembers.find(s => s.username === history.movementMadeBy)

    const movementReason = cellMoveTypes.find(type => type.code === history.assignmentReason)

    const assignmentTime = moment(history.assignmentDateTime, dateTimeFormat).format('HH:mm')

    const movedFrom = (cellHistoryByOffenderNo || [])
      .flatMap(offenderHistory => offenderHistory)
      .filter(
        ch =>
          ch?.offenderNo === history.offenderNo &&
          ch?.assignmentEndDate === history.assignmentDate &&
          history.livingUnitId !== ch.livingUnitId
      )
      .sort(latestBedAssignment)

    return {
      prisonerName: putLastNameFirst(offender?.firstName, offender?.lastName),
      offenderNo: history.offenderNo,
      movedFrom:
        (movedFrom.length && formatLocationDescription(movedFrom[0]?.description, movedFrom[0]?.agencyId)) ||
        'No cell allocated',
      movedTo: formatLocationDescription(history.description, history.agencyId),
      movedBy: formatName(staff?.firstName, staff?.lastName),
      reason: movementReason?.description || 'Not entered',
      time: assignmentTime,
    }
  })

  return res.render('changeSomeonesCell/cellMoveHistory.njk', {
    title: `Cell moves completed on ${moment(date, 'YYYY-MM-DD').format('dddd D MMMM YYYY')}`,
    historyByDate,
    cellMoveReasons,
    locations,
    formValues: {
      date,
      locationId,
      reason,
    },
  })
}
