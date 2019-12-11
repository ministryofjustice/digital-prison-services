const { switchDateFormat, getTime, sortByDateTime } = require('../utils')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { activeCaseLoadId: agencyId } = req.session.userDetails
  const { date, offenderNo } = req.query

  const searchCriteria = { agencyId, date: switchDateFormat(date), offenderNumbers: [offenderNo] }

  try {
    const existingEvents = await Promise.all([
      elite2Api.getVisits(res.locals, searchCriteria),
      elite2Api.getAppointments(res.locals, searchCriteria),
      elite2Api.getExternalTransfers(res.locals, searchCriteria),
      elite2Api.getCourtEvents(res.locals, searchCriteria),
      elite2Api.getActivities(res.locals, searchCriteria),
    ]).then(events => events.reduce((flattenedEvents, event) => flattenedEvents.concat(event), []))

    const formattedExistingEvents = existingEvents
      .sort((left, right) => sortByDateTime(left.startTime, right.startTime))
      .map(event => ({
        ...event,
        startTime: getTime(event.startTime),
        endTime: event.endTime && getTime(event.endTime),
      }))

    return res.json(formattedExistingEvents)
  } catch (error) {
    const errorMessage = 'Error retrieving existing events for offender'
    if (error) logError(req.originalUrl, error, errorMessage)
    res.status(500)
    return res.json({ errorMessage })
  }
}
