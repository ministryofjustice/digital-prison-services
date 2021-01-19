const createTransactionViewModel = require('../../../shared/createTransactionViewModel')

module.exports = ({ prisonApi, prisonerFinanceService }) => async (req, res) => {
  const { month, year } = req.query
  const { offenderNo } = req.params

  try {
    const { allTransactionsForDateRange, templateData } = await prisonerFinanceService.getPrisonerFinanceData(
      res.locals,
      offenderNo,
      'spends',
      month,
      year
    )

    const uniqueAgencyIds = [...new Set(allTransactionsForDateRange.map(transaction => transaction.agencyId))]
    const prisons = await Promise.all(uniqueAgencyIds.map(agencyId => prisonApi.getAgencyDetails(res.locals, agencyId)))

    return res.render('prisonerProfile/prisonerFinance/spends.njk', {
      ...templateData,
      spendsRows: createTransactionViewModel(allTransactionsForDateRange, prisons),
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
