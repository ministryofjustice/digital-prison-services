import moment from 'moment'
import createTransactionViewModel from '../../../shared/createTransactionViewModel'
import { formatTimestampToDate } from '../../../utils'

const batchTransactionsOnly = (transaction) => transaction?.relatedOffenderTransactions?.length

const nonZeroInputPaymentsOnly = (relatedTransaction) => relatedTransaction?.penceAmount !== 0

const sortByRecentEntryDateThenByRecentCalendarDate = (left, right) => {
  const entryDateDiff = moment(right.entryDate).valueOf() - moment(left.entryDate).valueOf()
  if (entryDateDiff !== 0) return entryDateDiff

  if (left.calendarDate && right.calendarDate)
    return moment(right.calendarDate).valueOf() - moment(left.calendarDate).valueOf()

  return 0
}

export default ({ prisonApi, prisonerFinanceService }) =>
  async (req, res) => {
    const { month, year } = req.query
    const { offenderNo } = req.params

    const accountCode = 'spends'
    try {
      const [allTransactionsForDateRange, templateData] = await Promise.all([
        prisonerFinanceService.getTransactionsForDateRange(res.locals, offenderNo, accountCode, month, year),
        prisonerFinanceService.getTemplateData(res.locals, offenderNo, accountCode, month, year),
      ])
      const uniqueAgencyIds = [...new Set(allTransactionsForDateRange.map((transaction) => transaction.agencyId))]
      const prisons = await Promise.all(
        uniqueAgencyIds.map((agencyId) => prisonApi.getAgencyDetails(res.locals, agencyId))
      )

      const relatedTransactions = allTransactionsForDateRange
        .filter(batchTransactionsOnly)
        .flatMap((batchTransaction) => {
          const related = batchTransaction.relatedOffenderTransactions
            .map((relatedTransaction) => ({
              id: batchTransaction.id,
              entryDate: batchTransaction.entryDate,
              agencyId: batchTransaction.agencyId,
              penceAmount: relatedTransaction.payAmount,
              currentBalance: relatedTransaction.currentBalance,
              entryDescription: `${relatedTransaction.paymentDescription} from ${formatTimestampToDate(
                relatedTransaction.calendarDate
              )}`,
              postingType: 'CR',
              calendarDate: relatedTransaction.calendarDate,
            }))
            .filter(nonZeroInputPaymentsOnly)

          return related
        })

      const transactionsExcludingRelated = allTransactionsForDateRange.filter(
        (transaction) => !batchTransactionsOnly(transaction)
      )

      const allTransactions = [...transactionsExcludingRelated, ...relatedTransactions]
        .filter(nonZeroInputPaymentsOnly)
        .sort(sortByRecentEntryDateThenByRecentCalendarDate)

      return res.render('prisonerProfile/prisonerFinance/spends.njk', {
        ...templateData,
        spendsRows: createTransactionViewModel(allTransactions, prisons),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
