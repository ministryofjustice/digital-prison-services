const existingEventsService = require('./existingEventsService')
const { properCaseName } = require('../../utils')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { activeCaseLoadId: agencyId } = req.session.userDetails
  const { date, offenderNo } = req.query

  try {
    const [offenderDetails, events] = await Promise.all([
      elite2Api.getDetails(res.locals, offenderNo),
      existingEventsService(elite2Api).getExistingEventsForOffender(res.locals, agencyId, date, offenderNo),
    ])
    const name = `${properCaseName(offenderDetails.lastName)}, ${properCaseName(offenderDetails.firstName)}`

    return res.render('components/scheduledEvents/scheduledEvents.njk', {
      events,
      name,
      type: 'offender',
    })
  } catch (error) {
    const errorMessage = 'Error retrieving existing events for offender'
    if (error) logError(req.originalUrl, error, errorMessage)
    res.status(500)
    return res.json({ errorMessage })
  }
}
