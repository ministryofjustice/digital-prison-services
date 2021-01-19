const moment = require('moment')
const { alerts } = require('../../services/covidService')

module.exports = ({ covidService }) => {
  const formatResult = result => ({
    bookingId: result.bookingId,
    offenderNo: result.offenderNo,
    name: result.name,
    assignedLivingUnitDesc: result.assignedLivingUnitDesc,
    alertCreated: moment(result.alertCreated),
  })

  return async (req, res) => {
    const results = await covidService.getAlertList(res, alerts.shieldingUnit)
    const formattedResults = results.map(formatResult).sort((left, right) => left.name.localeCompare(right.name))

    return res.render('covid/shieldingUnit.njk', {
      title: 'Prisoners in the Shielding Unit',
      results: formattedResults,
    })
  }
}
