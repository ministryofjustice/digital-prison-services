const moment = require('moment')
const { sortByDateTime } = require('../../utils')
const { alerts } = require('../../services/covidService')

module.exports = ({ covidService, nowGetter = moment }) => {
  const formatResult = result => {
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
