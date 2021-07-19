// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'endRecurri... Remove this comment to see the full error message
const { endRecurringEndingDate } = require('../../shared/appointmentConstants')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'buildDateT... Remove this comment to see the full error message
const { buildDateTime } = require('../../../common/dateHelpers')

module.exports = (req, res) => {
  const { date, repeats, times } = req.query
  const startTime = buildDateTime({ date, hours: '00', minutes: '00' })
  const endDate = endRecurringEndingDate({ date, startTime, repeats, times }).endOfPeriod.format('dddd D MMMM YYYY')

  return res.send(endDate)
}
