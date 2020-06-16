const { alerts } = require('../../services/covidService')

module.exports = ({ covidService, logError }) => {
  const formatResult = result => ({
    bookingId: result.bookingId,
    offenderNo: result.offenderNo,
    name: result.name,
    assignedLivingUnitDesc: result.assignedLivingUnitDesc,
  })

  return async (req, res) => {
    try {
      const results = await covidService.getAlertList(res, alerts.refusingToShield)

      const formattedResults = results.map(formatResult).sort((left, right) => left.name.localeCompare(right.name))

      return res.render('covid/refusingToShield.njk', {
        title: 'Prisoners refusing to shield',
        results: formattedResults,
      })
    } catch (e) {
      logError(req.originalUrl, e, 'Failed to load list of prisoners refusing to shield')
      return res.render('error.njk', { url: '/current-covid-units/refusing-to-shield' })
    }
  }
}
