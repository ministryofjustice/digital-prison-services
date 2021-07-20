// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isBeforeTo... Remove this comment to see the full error message
const { isBeforeToday, sortByDateTime } = require('../../utils')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'alerts'.
const { alerts } = require('../../services/covidService')

module.exports = ({ covidService }) => {
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
