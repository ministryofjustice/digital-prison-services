const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const filterActivitiesByPeriod = require('../../shared/filterActivitiesByPeriod')
const { formatName, putLastNameFirst, groupBy, times } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  let schedule
  const { when } = req.query
  const { offenderNo } = req.params

  try {
    const details = await elite2Api.getDetails(res.locals, offenderNo)
    const { bookingId, firstName, lastName } = details || {}

    if (when === 'nextWeek') {
      schedule = await elite2Api.getScheduledEventsForNextWeek(res.locals, bookingId)
    } else {
      schedule = await elite2Api.getScheduledEventsForThisWeek(res.locals, bookingId)
    }

    const groupedByDate = groupBy(schedule, 'eventDate')
    const oneWeekToday = moment().add(1, 'week')
    const startOfWeek = when === 'nextWeek' ? moment(oneWeekToday) : moment()
    const selectedWeekDates = []

    times(7)(i =>
      selectedWeekDates.push({
        date: moment(startOfWeek)
          .add(i, 'days')
          .format('YYYY-MM-DD'),
      })
    )

    const days = selectedWeekDates.map(day => {
      return {
        date: moment(day.date).format('dddd D MMMM YYYY'),
        periods: filterActivitiesByPeriod(groupedByDate[day.date]),
      }
    })

    return res.render('prisonerProfile/prisonerSchedule/prisonerSchedule.njk', {
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      days,
      dpsUrl,
      offenderNo,
      prisonerName: formatName(firstName, lastName),
      nextWeekStartDate: oneWeekToday.format('D MMMM YYYY'),
      when,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: '/' })
  }
}
