import moment from 'moment'
import { notEnteredMessage } from '../../common-messages'

import {
  formatName,
  formatTimestampToDateTime,
  sortByDateTime,
  putLastNameFirst,
  hasLength,
  extractLocation,
} from '../../utils'

const fetchStaffName = (context, staffId, prisonApi) =>
  prisonApi.getStaffDetails(context, staffId).then((staff) => formatName(staff.firstName, staff.lastName))

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
      .then((cellMoveReason) => caseNotesApi.getCaseNote(context, offenderNo, cellMoveReason.cellMoveReason.caseNoteId))
      .then((caseNote) => caseNote.text)
  } catch (err) {
    if (err?.response?.status === 404) return null
    throw err
  }
}

const mapReasonToCellMoveReasonDescription = ({ cellMoveReasonTypes, assignmentReason }) =>
  cellMoveReasonTypes.find((type) => type.code === assignmentReason)?.description

export default ({ prisonApi, whereaboutsApi, caseNotesApi }) =>
  async (req, res) => {
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

      const userCaseLoadIds = userCaseLoads.map((caseLoad) => caseLoad.caseLoadId)
      const { bookingId, firstName, lastName } = prisonerDetails
      const currentPrisonerDetails = locationHistory.find((record) => record.bookingId === bookingId) || {}
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
        mapReasonToCellMoveReasonDescription({
          cellMoveReasonTypes: await prisonApi.getCellMoveReasonTypes(res.locals),
          assignmentReason,
        })

      const locationHistoryWithPrisoner =
        hasLength(locationHistory) &&
        (await Promise.all(
          locationHistory.map(async (record) => ({
            ...record,
            ...(await prisonApi.getPrisonerDetail(res.locals, record.bookingId)),
          }))
        ))

      const prisonerName = formatName(firstName, lastName)
      const getMovedOutText = (sharingOffenderEndTime) => {
        if (!currentPrisonerDetails.assignmentEndDateTime && !sharingOffenderEndTime) return 'Currently sharing'
        if (currentPrisonerDetails.assignmentEndDateTime && !sharingOffenderEndTime) return `${prisonerName} moved out`
        if (sharingOffenderEndTime) return formatTimestampToDateTime(sharingOffenderEndTime)
        return null
      }

      return res.render('prisonerProfile/prisonerLocationHistory.njk', {
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
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
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'bookingId' does not exist on type 'unkno... Remove this comment to see the full error message
            .filter((prisoner) => prisoner.bookingId !== bookingId)
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'assignmentDateTime' does not exist on ty... Remove this comment to see the full error message
            .sort((left, right) => sortByDateTime(right.assignmentDateTime, left.assignmentDateTime))
            .map((prisoner) => ({
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'agencyId' does not exist on type 'unknow... Remove this comment to see the full error message
              shouldLink: hasLength(userCaseLoadIds) && userCaseLoadIds.includes(prisoner.agencyId),
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'firstName' does not exist on type 'unkno... Remove this comment to see the full error message
              name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'offenderNo' does not exist on type 'unkn... Remove this comment to see the full error message
              number: prisoner.offenderNo,
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'assignmentDateTime' does not exist on ty... Remove this comment to see the full error message
              movedIn: prisoner.assignmentDateTime && formatTimestampToDateTime(prisoner.assignmentDateTime),
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'assignmentEndDateTime' does not exist on... Remove this comment to see the full error message
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
