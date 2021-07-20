// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')

module.exports = ({ covidService }) => {
  const formatResult = (result) => ({
    bookingId: result.bookingId,
    offenderNo: result.offenderNo,
    name: result.name,
    assignedLivingUnitDesc: result.assignedLivingUnitDesc,
    arrivalDate: moment(result.arrivalDate),
  })

  return async (req, res) => {
    const results = await covidService.getUnassignedNewEntrants(res)
    const formattedResults = results.map(formatResult).sort((left, right) => left.name.localeCompare(right.name))

    return res.render('covid/notInUnit.njk', {
      title: 'Newly arrived prisoners not in Reverse Cohorting Unit',
      results: formattedResults,
    })
  }
}
