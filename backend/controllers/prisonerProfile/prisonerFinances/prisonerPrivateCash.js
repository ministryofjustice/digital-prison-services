const { formatCurrency, sortByDateTime } = require('../../../utils')
const createTransactionViewModel = require('../../../shared/createTransactionViewModel')

module.exports = ({ prisonApi, prisonerFinanceService }) => async (req, res) => {
  const { month, year } = req.query
  const { offenderNo } = req.params
  const accountCode = 'cash'

  try {
    const [addHoldFunds, withheldFunds, allTransactionsForDateRange, templateData] = await Promise.all([
      prisonApi.getTransactionHistory(res.locals, offenderNo, { account_code: accountCode, transaction_type: 'HOA' }),
      prisonApi.getTransactionHistory(res.locals, offenderNo, { account_code: accountCode, transaction_type: 'WHF' }),
      prisonerFinanceService.getTransactionsForDateRange(res.locals, offenderNo, accountCode, month, year),
      prisonerFinanceService.getTemplateData(res.locals, offenderNo, accountCode, month, year),
    ])

    const sortedPendingTransactions = [...addHoldFunds, ...withheldFunds].sort((left, right) =>
      sortByDateTime(right.entryDate, left.entryDate)
    )

    const pendingBalanceInPence = sortedPendingTransactions.reduce(
      (acc, current) => (current.postingType === 'DR' ? acc - current.penceAmount : acc + current.penceAmount),
      0
    )

    const nonPendingTransactions = allTransactionsForDateRange.filter(
      transaction => !['HOA', 'WHF'].includes(transaction.transactionType)
    )

    const uniqueAgencyIds = [
      ...new Set(
        [...sortedPendingTransactions, ...allTransactionsForDateRange].map(transaction => transaction.agencyId)
      ),
    ]
    const prisons = await Promise.all(uniqueAgencyIds.map(agencyId => prisonApi.getAgencyDetails(res.locals, agencyId)))

    return res.render('prisonerProfile/prisonerFinance/privateCash.njk', {
      ...templateData,
      nonPendingRows: createTransactionViewModel(nonPendingTransactions, prisons),
      pendingBalance: formatCurrency(pendingBalanceInPence / 100),
      pendingRows: createTransactionViewModel(sortedPendingTransactions, prisons),
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
