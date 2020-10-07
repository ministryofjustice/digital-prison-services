const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
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

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { agencyId, locationId, fromDate, toDate = moment().format('YYYY-MM-DD') } = req.query

  try {
    const [prisonerDetails, locationAttributes, locationHistory, agencyDetails, userCaseLoads] = await Promise.all([
      elite2Api.getDetails(res.locals, offenderNo),
      elite2Api.getAttributesForLocation(res.locals, locationId),
      elite2Api.getHistoryForLocation(res.locals, { locationId, fromDate, toDate }),
      elite2Api.getAgencyDetails(res.locals, agencyId),
      elite2Api.userCaseLoads(res.locals),
    ])

    const userCaseLoadIds = userCaseLoads.map(caseLoad => caseLoad.caseLoadId)

    const { bookingId, firstName, lastName } = prisonerDetails

    const currentPrisonerDetails = locationHistory.find(record => record.bookingId === bookingId) || {}

    const locationHistoryWithPrisoner =
      hasLength(locationHistory) &&
      (await Promise.all(
        locationHistory.map(async record => ({
          ...record,
          ...(await elite2Api.getPrisonerDetail(res.locals, record.bookingId)),
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
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
  }
}
