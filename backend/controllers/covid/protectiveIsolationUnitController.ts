// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sortByDate... Remove this comment to see the full error message
const { sortByDateTime } = require('../../utils')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'alerts'.
const { alerts } = require('../../services/covidService')

module.exports = ({ covidService, nowGetter = moment }) => {
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
    const results = await covidService.getAlertList(res, alerts.protectiveIsolationUnit)

    const formattedResults = results
      .map(formatResult)
      .sort((left, right) => sortByDateTime(left.alertCreated, right.alertCreated))

    return res.render('covid/protectiveIsolationUnit.njk', {
      title: 'Prisoners in the Protective Isolation Unit',
      results: formattedResults,
    })
  }
}
