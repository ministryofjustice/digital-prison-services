const { formatCurrency } = require('../../../utils')
const createTransactionViewModel = require('../../../shared/createTransactionViewModel')

module.exports = ({ prisonApi, prisonerFinanceService }) => async (req, res) => {
  const { month, year } = req.query
  const { offenderNo } = req.params

  try {
    const [pendingTransactions, prisonerFinanceData] = await Promise.all([
      prisonApi.getTransactionHistory(res.locals, offenderNo, { account_code: 'cash', transaction_type: 'HOA' }),
      prisonerFinanceService.getPrisonerFinanceData(res.locals, offenderNo, 'cash', month, year),
    ])

    const pendingBalanceInPence = pendingTransactions.reduce(
      (acc, current) => (current.postingType === 'DR' ? acc - current.penceAmount : acc + current.penceAmount),
      0
    )

    const { allTransactionsForDateRange, templateData } = prisonerFinanceData

    const nonPendingTransactions = allTransactionsForDateRange.filter(
      transaction => transaction.transactionType !== 'HOA'
    )

    const uniqueAgencyIds = [
      ...new Set([...pendingTransactions, ...allTransactionsForDateRange].map(transaction => transaction.agencyId)),
    ]
    const prisons = await Promise.all(uniqueAgencyIds.map(agencyId => prisonApi.getAgencyDetails(res.locals, agencyId)))

    return res.render('prisonerProfile/prisonerFinance/privateCash.njk', {
      ...templateData,
      nonPendingRows: createTransactionViewModel(nonPendingTransactions, prisons),
      pendingBalance: formatCurrency(pendingBalanceInPence / 100),
      pendingRows: createTransactionViewModel(pendingTransactions, prisons),
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
