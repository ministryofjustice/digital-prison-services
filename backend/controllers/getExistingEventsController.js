const existingEventsService = require('./existingEventsService')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { activeCaseLoadId: agencyId } = req.session.userDetails
  const { date, offenderNo } = req.query

  try {
    const formattedEvents = await existingEventsService(elite2Api).getExistingEventsForOffender(
      res.locals,
      agencyId,
      date,
      offenderNo
    )

    return res.render('appointmentClashes.njk', { clashes: formattedEvents })
  } catch (error) {
    const errorMessage = 'Error retrieving existing events for offender'
    if (error) logError(req.originalUrl, error, errorMessage)
    res.status(500)
    return res.json({ errorMessage })
  }
}
