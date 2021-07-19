// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createTran... Remove this comment to see the full error message
const createTransactionViewModel = require('../../../shared/createTransactionViewModel')

module.exports =
  ({ prisonApi, prisonerFinanceService }) =>
  async (req, res) => {
    const { month, year } = req.query
    const { offenderNo } = req.params
    const accountCode = 'savings'

    try {
      const [allTransactionsForDateRange, templateData] = await Promise.all([
        prisonerFinanceService.getTransactionsForDateRange(res.locals, offenderNo, accountCode, month, year),
        prisonerFinanceService.getTemplateData(res.locals, offenderNo, accountCode, month, year),
      ])

      const uniqueAgencyIds = [...new Set(allTransactionsForDateRange.map((transaction) => transaction.agencyId))]
      const prisons = await Promise.all(
        uniqueAgencyIds.map((agencyId) => prisonApi.getAgencyDetails(res.locals, agencyId))
      )

      return res.render('prisonerProfile/prisonerFinance/savings.njk', {
        ...templateData,
        savingsRows: createTransactionViewModel(allTransactionsForDateRange, prisons),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
