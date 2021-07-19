// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatName... Remove this comment to see the full error message
const { formatName } = require('../../utils')

module.exports =
  ({ prisonApi, logError, existingEventsService }) =>
  async (req, res) => {
    const { activeCaseLoadId: agencyId } = req.session.userDetails
    const { date, offenderNo } = req.query

    try {
      const [offenderDetails, events] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        existingEventsService.getExistingEventsForOffender(res.locals, agencyId, date, offenderNo),
      ])

      return res.render('components/scheduledEvents/scheduledEvents.njk', {
        events,
        date: moment(date, 'DD/MM/YYYY').format('D MMMM YYYY'),
        prisonerName: formatName(offenderDetails.firstName, offenderDetails.lastName),
        type: 'offender',
      })
    } catch (error) {
      const errorMessage = 'Error retrieving existing events for offender'
      if (error) logError(req.originalUrl, error, errorMessage)
      res.status(500)
      return res.json({ errorMessage })
    }
  }
