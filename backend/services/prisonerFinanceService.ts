import moment from 'moment'
import { formatCurrency, putLastNameFirst, formatName } from '../utils'

export default (prisonApi) => {
  const today = moment()
  const currentMonth = today.month()
  const currentYear = today.year()

  const getTransactionsForDateRange = async (
    context,
    offenderNo,
    accountCode,
    month = currentMonth,
    year = currentYear
  ) => {
    const selectedMonthAndYear = moment().set({ month, year })
    const isCurrentMonthAndYear = selectedMonthAndYear.isSame(today, 'month')
    const isFutureMonthAndYear = selectedMonthAndYear.isAfter(today, 'month')

    if (isFutureMonthAndYear) return []

    return prisonApi.getTransactionHistory(context, offenderNo, {
      from_date: selectedMonthAndYear.startOf('month').format('YYYY-MM-DD'),
      to_date: isCurrentMonthAndYear
        ? today.format('YYYY-MM-DD')
        : selectedMonthAndYear.endOf('month').format('YYYY-MM-DD'),
      account_code: accountCode,
    })
  }

  const getTemplateData = async (context, offenderNo, accountCode, month = currentMonth, year = currentYear) => {
    const noOfSelectableYears = 4
    const yearOptions = Array.from({ length: noOfSelectableYears }, (v, i) => currentYear - noOfSelectableYears + i + 1)

    const prisonerDetails = await prisonApi.getDetails(context, offenderNo)
    const balanceData = await prisonApi.getPrisonerBalances(context, prisonerDetails.bookingId)

    return {
      currentBalance: formatCurrency(balanceData?.[accountCode] || 0, balanceData?.currency),
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      formValues: { selectedMonth: parseInt(month, 10), selectedYear: parseInt(year, 10) },
      monthOptions: moment.months().map((m, i) => ({ value: i, text: m })),
      period: moment().set({ month, year }).format('MMMM YYYY'),
      prisoner: {
        nameForBreadcrumb: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
        name: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
        offenderNo,
      },
      showDamageObligationsLink: balanceData?.damageObligations > 0,
      yearOptions: yearOptions.map((yyyy) => ({ value: yyyy, text: yyyy })),
    }
  }

  return {
    getTransactionsForDateRange,
    getTemplateData,
  }
}
