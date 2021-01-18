const moment = require('moment')
const { notEnteredMessage } = require('../../common-messages')
const {
  formatName,
  formatTimestampToDateTime,
  sortByDateTime,
  putLastNameFirst,
  hasLength,
  extractLocation,
} = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const fetchStaffName = (context, staffId, prisonApi) =>
  prisonApi.getStaffDetails(context, staffId).then(staff => formatName(staff.firstName, staff.lastName))

const fetchWhatHappened = async (
  context,
  offenderNo,
  bookingId,
  bedAssignmentHistorySequence,
  caseNotesApi,
  whereaboutsApi
) => {
  try {
    return await whereaboutsApi
      .getCellMoveReason(context, bookingId, bedAssignmentHistorySequence)
      .then(cellMoveReason => caseNotesApi.getCaseNote(context, offenderNo, cellMoveReason.cellMoveReason.caseNoteId))
      .then(caseNote => caseNote.text)
  } catch (err) {
    if (err?.response?.status === 404) return null
    throw err
  }
}

const mapReasonToCaseNoteSubTypeDescription = ({ caseNoteTypes, assignmentReason }) =>
  caseNoteTypes
    .filter(type => type.code === 'MOVED_CELL')
    .flatMap(cellMoveTypes => cellMoveTypes.subCodes)
    .find(subType => subType.code === assignmentReason)?.description

module.exports = ({ prisonApi, whereaboutsApi, caseNotesApi }) => async (req, res) => {
  const { offenderNo } = req.params
  const { agencyId, locationId, fromDate, toDate = moment().format('YYYY-MM-DD') } = req.query

  try {
    const [prisonerDetails, locationAttributes, locationHistory, agencyDetails, userCaseLoads] = await Promise.all([
      prisonApi.getDetails(res.locals, offenderNo),
      prisonApi.getAttributesForLocation(res.locals, locationId),
      prisonApi.getHistoryForLocation(res.locals, { locationId, fromDate, toDate }),
      prisonApi.getAgencyDetails(res.locals, agencyId),
      prisonApi.userCaseLoads(res.locals),
    ])

    const userCaseLoadIds = userCaseLoads.map(caseLoad => caseLoad.caseLoadId)
    const { bookingId, firstName, lastName } = prisonerDetails
    const currentPrisonerDetails = locationHistory.find(record => record.bookingId === bookingId) || {}
    const { movementMadeBy, assignmentReason, bedAssignmentHistorySequence } = currentPrisonerDetails

    const movementMadeByName = await fetchStaffName(res.locals, movementMadeBy, prisonApi)
    const whatHappenedDetails = await fetchWhatHappened(
      res.locals,
      offenderNo,
      bookingId,
      bedAssignmentHistorySequence,
      caseNotesApi,
      whereaboutsApi
    )

    const isDpsCellMove = Boolean(whatHappenedDetails)

    const assignmentReasonName =
      isDpsCellMove &&
      mapReasonToCaseNoteSubTypeDescription({
        caseNoteTypes: await caseNotesApi.getCaseNoteTypes(res.locals),
        assignmentReason,
      })

    const locationHistoryWithPrisoner =
      hasLength(locationHistory) &&
      (await Promise.all(
        locationHistory.map(async record => ({
          ...record,
          ...(await prisonApi.getPrisonerDetail(res.locals, record.bookingId)),
        }))
      ))

    const prisonerName = formatName(firstName, lastName)
    const getMovedOutText = sharingOffenderEndTime => {
      if (!currentPrisonerDetails.assignmentEndDateTime && !sharingOffenderEndTime) return 'Currently sharing'
      if (currentPrisonerDetails.assignmentEndDateTime && !sharingOffenderEndTime) return `${prisonerName} moved out`
      if (sharingOffenderEndTime) return formatTimestampToDateTime(sharingOffenderEndTime)
      return null
    }

    return res.render('prisonerProfile/prisonerLocationHistory.njk', {
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      dpsUrl,
      locationDetails: {
        description: agencyDetails.description,
        movedIn:
          currentPrisonerDetails.assignmentDateTime &&
          formatTimestampToDateTime(currentPrisonerDetails.assignmentDateTime),
        movedOut: currentPrisonerDetails.assignmentEndDateTime
          ? formatTimestampToDateTime(currentPrisonerDetails.assignmentEndDateTime)
          : 'Current cell',
        movedBy: movementMadeByName,
        reasonForMove: assignmentReasonName || notEnteredMessage,
        whatHappened: whatHappenedDetails || notEnteredMessage,
        attributes: locationAttributes.attributes,
      },
      locationSharingHistory:
        hasLength(locationHistoryWithPrisoner) &&
        locationHistoryWithPrisoner
          .filter(prisoner => prisoner.bookingId !== bookingId)
          .sort((left, right) => sortByDateTime(right.assignmentDateTime, left.assignmentDateTime))
          .map(prisoner => ({
            shouldLink: hasLength(userCaseLoadIds) && userCaseLoadIds.includes(prisoner.agencyId),
            name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
            number: prisoner.offenderNo,
            movedIn: prisoner.assignmentDateTime && formatTimestampToDateTime(prisoner.assignmentDateTime),
            movedOut: getMovedOutText(prisoner.assignmentEndDateTime),
          })),
      profileUrl: `/prisoner/${offenderNo}`,
      prisonerName,
      locationName: extractLocation(locationAttributes.description, agencyId),
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
