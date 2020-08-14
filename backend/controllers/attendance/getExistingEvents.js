const { formatName } = require('../../utils')

module.exports = ({ elite2Api, logError, existingEventsService }) => async (req, res) => {
  const { activeCaseLoadId: agencyId } = req.session.userDetails
  const { date, offenderNo } = req.query

  try {
    const [offenderDetails, events] = await Promise.all([
      elite2Api.getDetails(res.locals, offenderNo),
      existingEventsService.getExistingEventsForOffender(res.locals, agencyId, date, offenderNo),
    ])

    const formattedName = formatName(offenderDetails.firstName, offenderDetails.lastName)

    const prisonerName =
      formattedName && formattedName[formattedName.length - 1] !== 's' ? [formattedName, 's'] : [formattedName]

    return res.render('components/scheduledEvents/scheduledEvents.njk', {
      events,
      prisonerName,
      type: 'offender',
    })
  } catch (error) {
    const errorMessage = 'Error retrieving existing events for offender'
    if (error) logError(req.originalUrl, error, errorMessage)
    res.status(500)
    return res.json({ errorMessage })
  }
}
