import moment from 'moment'
import { isBeforeToday, sortByDateTime } from '../../utils'
import { alerts } from '../../services/covidService'

export default ({ covidService }) => {
  const formatResult = (result) => {
    const alertCreated = moment(result.alertCreated)
    const expectedMoveDate = moment(result.alertCreated).add(14, 'days')
    const isOverdue = isBeforeToday(expectedMoveDate)
    return {
      bookingId: result.bookingId,
      offenderNo: result.offenderNo,
      name: result.name,
      assignedLivingUnitDesc: result.assignedLivingUnitDesc,
      alertCreated,
      expectedMoveDate,
      isOverdue,
    }
  }

  return async (req, res) => {
    const results = await covidService.getAlertList(res, alerts.reverseCohortingUnit)
    const notInUnit = await covidService.getUnassignedNewEntrants(res)

    const formattedResults = results
      .map(formatResult)
      .sort((left, right) => sortByDateTime(left.alertCreated, right.alertCreated))

    return res.render('covid/reverseCohortingUnit.njk', {
      title: 'Prisoners in the Reverse Cohorting Unit',
      results: formattedResults,
      notInUnitCount: notInUnit.length,
    })
  }
}
