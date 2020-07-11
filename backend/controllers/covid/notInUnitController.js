const moment = require('moment')

module.exports = ({ covidService, logError }) => {
  const formatResult = result => ({
    bookingId: result.bookingId,
    offenderNo: result.offenderNo,
    name: result.name,
    assignedLivingUnitDesc: result.assignedLivingUnitDesc,
    arrivalDate: moment(result.arrivalDate),
  })

  return async (req, res) => {
    try {
      const results = await covidService.getUnassignedNewEntrants(res)

      const formattedResults = results.map(formatResult).sort((left, right) => left.name.localeCompare(right.name))

      return res.render('covid/notInUnit.njk', {
        title: 'Newly arrived prisoners not in Reverse Cohorting Unit',
        results: formattedResults,
      })
    } catch (e) {
      logError(req.originalUrl, e, 'Failed to load not in unit list')
      return res.render('error.njk', { url: '/current-covid-units/not-in-unit' })
    }
  }
}
