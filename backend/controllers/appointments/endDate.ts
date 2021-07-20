import { endRecurringEndingDate } from '../../shared/appointmentConstants'
import { buildDateTime } from '../../../common/dateHelpers'

export default (req, res) => {
  const { date, repeats, times } = req.query
  const startTime = buildDateTime({ date, hours: '00', minutes: '00' })
  const endDate = endRecurringEndingDate({ date, startTime, repeats, times }).endOfPeriod.format('dddd D MMMM YYYY')

  return res.send(endDate)
}
