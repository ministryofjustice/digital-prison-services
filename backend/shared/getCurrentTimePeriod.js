const moment = require('moment')

module.exports = (time = moment()) => {
  const midnight = moment('12:00a', 'HH:mm a')
  const midday = moment('12:00p', 'HH:mm a')
  const evening = moment('17:00p', 'HH:mm a')

  const isMorning = time.isBetween(midnight, midday, null, '[)')
  const isAfternoon = time.isBetween(midday, evening, null, '[)')

  if (isMorning) return 'AM'
  if (isAfternoon) return 'PM'
  return 'ED'
}
