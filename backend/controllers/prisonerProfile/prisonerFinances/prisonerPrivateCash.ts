// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatCurr... Remove this comment to see the full error message
const { formatCurrency, sortByDateTime } = require('../../../utils')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createTran... Remove this comment to see the full error message
const createTransactionViewModel = require('../../../shared/createTransactionViewModel')

module.exports =
  ({ prisonApi, prisonerFinanceService }) =>
  async (req, res) => {
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

      const sortedPendingTransactions = [...addHoldFunds, ...withheldFunds]
        .sort((left, right) => sortByDateTime(right.createDateTime, left.createDateTime))
        .filter((transaction) => !transaction.holdingCleared)

      const pendingBalanceInPence = sortedPendingTransactions.reduce(
        (result, current) => current.penceAmount + result,
        0
      )

      const uniqueAgencyIds = [
        ...new Set(
          [...sortedPendingTransactions, ...allTransactionsForDateRange].map((transaction) => transaction.agencyId)
        ),
      ]

      const prisons = await Promise.all(
        uniqueAgencyIds.map((agencyId) => prisonApi.getAgencyDetails(res.locals, agencyId))
      )

      const sortedTransactions = allTransactionsForDateRange.sort((left, right) =>
        sortByDateTime(right.createDateTime, left.createDateTime)
      )

      return res.render('prisonerProfile/prisonerFinance/privateCash.njk', {
        ...templateData,
        privateTransactionsRows: createTransactionViewModel(sortedTransactions, prisons),
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
        pendingBalance: formatCurrency(pendingBalanceInPence / 100),
        pendingRows: createTransactionViewModel(sortedPendingTransactions, prisons, false, true),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
