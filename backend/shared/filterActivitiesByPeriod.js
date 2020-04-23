const moment = require('moment')
const formatEvent = require('./formatEvent')

const filterMorning = activities =>
  activities && activities.filter(activity => moment(activity.startTime).get('hour') < 12)

const filterAfternoon = activities =>
  activities &&
  activities.filter(
    activity => moment(activity.startTime).get('hour') > 11 && moment(activity.startTime).get('hour') < 17
  )

const filterEveningDuties = activities =>
  activities && activities.filter(activity => moment(activity.startTime).get('hour') >= 17)

const byStartTimeThenByEndTime = (a, b) => {
  if (moment(a.startTime).isBefore(moment(b.startTime))) return -1

  if (moment(a.startTime).isAfter(moment(b.startTime))) return 1

  if (!a.endTime) return -1
  if (!b.endTime) return 1

  if (moment(a.endTime).isBefore(moment(b.endTime))) return -1
  if (moment(a.endTime).isAfter(moment(b.endTime))) return 1

  return 0
}

module.exports = events => {
  const morningActivity = filterMorning(events)
  const afternoonActivity = filterAfternoon(events)
  const eveningDuties = filterEveningDuties(events)

  return {
    morningActivities:
      morningActivity && morningActivity.map(activity => formatEvent(activity)).sort(byStartTimeThenByEndTime),
    afternoonActivities:
      afternoonActivity && afternoonActivity.map(activity => formatEvent(activity)).sort(byStartTimeThenByEndTime),
    eveningActivities:
      eveningDuties && eveningDuties.map(activity => formatEvent(activity)).sort(byStartTimeThenByEndTime),
  }
}
