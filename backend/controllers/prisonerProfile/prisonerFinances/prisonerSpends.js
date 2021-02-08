const createTransactionViewModel = require('../../../shared/createTransactionViewModel')
const { formatTimestampToDate, sortByDateTime } = require('../../../utils')

module.exports = ({ prisonApi, prisonerFinanceService }) => async (req, res) => {
  const { month, year } = req.query
  const { offenderNo } = req.params
  const accountCode = 'spends'

  try {
    const [allTransactionsForDateRange, templateData] = await Promise.all([
      prisonerFinanceService.getTransactionsForDateRange(res.locals, offenderNo, accountCode, month, year),
      prisonerFinanceService.getTemplateData(res.locals, offenderNo, accountCode, month, year),
    ])

    const uniqueAgencyIds = [...new Set(allTransactionsForDateRange.map(transaction => transaction.agencyId))]
    const prisons = await Promise.all(uniqueAgencyIds.map(agencyId => prisonApi.getAgencyDetails(res.locals, agencyId)))
    const batchTransactionsOnly = transaction => transaction?.relatedOffenderTransactions?.length

    const relatedTransactions = allTransactionsForDateRange
      .filter(batchTransactionsOnly)
      .flatMap(batchTransaction => {
        const related = batchTransaction.relatedOffenderTransactions.map(relatedTransaction => ({
          id: batchTransaction.id,
          entryDate: batchTransaction.entryDate,
          agencyId: batchTransaction.agencyId,
          penceAmount: relatedTransaction.payAmount,
          entryDescription: `${relatedTransaction.paymentDescription} from ${formatTimestampToDate(
            relatedTransaction.calendarDate
          )}`,
          postingType: 'CR',
          calendarDate: relatedTransaction.calendarDate,
        }))

        const sortedByLatestDate = related.sort((left, right) => sortByDateTime(left.calendarDate, right.calendarDate))

        const accumulatedFromBatch = related.reduce((result, current) => current.penceAmount + result, 0)
        const startingBalanceForBatch = batchTransaction.currentBalance - accumulatedFromBatch

        let runningTotal = 0
        return sortedByLatestDate.map(current => {
          runningTotal += current.penceAmount
          return {
            ...current,
            currentBalance: startingBalanceForBatch + runningTotal,
          }
        })
      })
      .reverse()

    const transactionsExcludingRelated = allTransactionsForDateRange.filter(
      transaction => !batchTransactionsOnly(transaction)
    )

    return res.render('prisonerProfile/prisonerFinance/spends.njk', {
      ...templateData,
      spendsRows: createTransactionViewModel([...transactionsExcludingRelated, ...relatedTransactions], prisons),
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
