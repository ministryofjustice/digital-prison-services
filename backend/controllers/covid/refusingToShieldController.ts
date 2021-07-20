import { alerts } from '../../services/covidService'

export default ({ covidService }) => {
  const formatResult = (result) => ({
    bookingId: result.bookingId,
    offenderNo: result.offenderNo,
    name: result.name,
    assignedLivingUnitDesc: result.assignedLivingUnitDesc,
  })

  return async (req, res) => {
    const results = await covidService.getAlertList(res, alerts.refusingToShield)
    const formattedResults = results.map(formatResult).sort((left, right) => left.name.localeCompare(right.name))

    return res.render('covid/refusingToShield.njk', {
      title: 'Prisoners refusing to shield',
      results: formattedResults,
    })
  }
}
