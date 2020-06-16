const moment = require('moment')
const { alerts } = require('../../services/covidService')

module.exports = ({ covidService, logError }) => {
  const formatResult = result => ({
    bookingId: result.bookingId,
    offenderNo: result.offenderNo,
    name: result.name,
    assignedLivingUnitDesc: result.assignedLivingUnitDesc,
    alertCreated: moment(result.alertCreated),
  })

  return async (req, res) => {
    try {
      const results = await covidService.getAlertList(res, alerts.shieldingUnit)

      const formattedResults = results.map(formatResult).sort((left, right) => left.name.localeCompare(right.name))

      return res.render('covid/shieldingUnit.njk', {
        title: 'Prisoners in the Shielding Unit',
        results: formattedResults,
      })
    } catch (e) {
      logError(req.originalUrl, e, 'Failed to load shielding list')
      return res.render('error.njk', { url: '/current-covid-units/shielding-unit' })
    }
  }
}
