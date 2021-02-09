const moment = require('moment')

const createTransactionViewModel = require('../../../shared/createTransactionViewModel')
const { formatTimestampToDate, sortByDateTime } = require('../../../utils')

const batchTransactionsOnly = transaction => transaction?.relatedOffenderTransactions?.length
const sortByEntryRecentDateThenByRecentCalendarDate = (left, right) => {
  if (left.entryDate && right.entryDate) return moment(right.entryDate).valueOf() - moment(left.entryDate).valueOf()
  if (left.entryDate) return -1
  if (right.entryDate) return 1

  if (left.calendarDate && right.calendarDate)
    return moment(right.calendarDate).valueOf() - moment(left.calendarDate).valueOf()
  if (left.calendarDate) return -1
  if (right.calendarDate) return 1

  return 0
}
const sortByOldestCalendarDate = (left, right) => sortByDateTime(left.calendarDate, right.calendarDate)

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

    const relatedTransactions = allTransactionsForDateRange
      .filter(batchTransactionsOnly)
      .sort(sortByOldestCalendarDate)
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

        let startingBalance = batchTransaction.currentBalance

        return related.map(current => {
          const withBalance = {
            ...current,
            currentBalance: startingBalance,
          }
          startingBalance -= current.penceAmount
          return withBalance
        })
      })

    const transactionsExcludingRelated = allTransactionsForDateRange.filter(
      transaction => !batchTransactionsOnly(transaction)
    )

    const allTransactions = [...transactionsExcludingRelated, ...relatedTransactions].sort(
      sortByEntryRecentDateThenByRecentCalendarDate
    )

    return res.render('prisonerProfile/prisonerFinance/spends.njk', {
      ...templateData,
      spendsRows: createTransactionViewModel(allTransactions, prisons),
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
