import moment from 'moment'
import { sortByDateTime } from '../../utils'
import { alerts } from '../../services/covidService'

export default ({ covidService, nowGetter = moment }) => {
  const formatResult = (result) => {
    const alertCreated = moment(result.alertCreated)
    const now = nowGetter()
    const daysInUnit = now.diff(alertCreated, 'days')
    return {
      bookingId: result.bookingId,
      offenderNo: result.offenderNo,
      name: result.name,
      assignedLivingUnitDesc: result.assignedLivingUnitDesc,
      alertCreated,
      daysInUnit,
    }
  }

  return async (req, res) => {
    const results = await covidService.getAlertList(req, res, alerts.protectiveIsolationUnit)

    const formattedResults = results
      .map(formatResult)
      .sort((left, right) => sortByDateTime(left.alertCreated, right.alertCreated))

    return res.render('covid/protectiveIsolationUnit.njk', {
      title: 'Prisoners in the Protective Isolation Unit',
      results: formattedResults,
    })
  }
}
