const moment = require('moment-business-days')
const { DayOfTheWeek, DATE_TIME_FORMAT_SPEC } = require('../dateHelpers')

const repeatsToMomentMap = {
  WEEKLY: 'weeks',
  DAILY: 'day',
  WEEKDAYS: 'day',
  YEARLY: 'years',
  MONTHLY: 'month',
  FORTNIGHTLY: 'weeks',
}

const calculateEndDate = ({ startTime, repeats, numberOfTimes }) => {
  if (!startTime) return null

  const unitOfTime = repeatsToMomentMap[repeats]
  const repeatNumber = Number(numberOfTimes)
  const inclusiveAdjustment = repeatNumber ? repeatNumber - 1 : repeatNumber
  const times = repeats === 'FORTNIGHTLY' ? Number(inclusiveAdjustment * 2) : Number(inclusiveAdjustment)

  return repeats === 'WEEKDAYS'
    ? moment(startTime, DATE_TIME_FORMAT_SPEC).businessAdd(times)
    : moment(startTime, DATE_TIME_FORMAT_SPEC).add(times, unitOfTime)
}

const recurringEndDate = values => {
  const endDate = calculateEndDate({
    startTime: values.startTime,
    repeats: values.repeats,
    numberOfTimes: values.times,
  })

  return endDate && `${DayOfTheWeek(endDate)}, ${endDate.format('MMMM Do YYYY')}`
}

module.exports = {
  calculateEndDate,
  recurringEndDate,
}
