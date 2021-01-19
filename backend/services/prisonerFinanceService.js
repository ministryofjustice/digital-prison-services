const moment = require('moment')
const { formatCurrency, putLastNameFirst, formatName } = require('../utils')

module.exports = prisonApi => {
  const today = moment()

  const getPrisonerFinanceData = async (
    context,
    offenderNo,
    accountCode,
    month = today.month(),
    year = today.year()
  ) => {
    const noOfSelectableYears = 4
    const yearOptions = Array.from(
      { length: noOfSelectableYears },
      (v, i) => today.year() - noOfSelectableYears + i + 1
    )

    const prisonerDetails = await prisonApi.getDetails(context, offenderNo)

    const selectedMonthAndYear = moment().set({ month, year })
    const isCurrentMonthAndYear = selectedMonthAndYear.isSame(today, 'month', 'year')
    const isFutureMonthAndYear = selectedMonthAndYear.isAfter(today)

    const allTransactionsForDateRange = isFutureMonthAndYear
      ? []
      : await prisonApi.getTransactionHistory(context, offenderNo, {
          from_date: selectedMonthAndYear.startOf('month').format('YYYY-MM-DD'),
          to_date: isCurrentMonthAndYear
            ? today.format('YYYY-MM-DD')
            : selectedMonthAndYear.endOf('month').format('YYYY-MM-DD'),
          account_code: accountCode,
        })

    const balanceData = await prisonApi.getPrisonerBalances(context, prisonerDetails.bookingId)

    return {
      allTransactionsForDateRange,
      templateData: {
        currentBalance: formatCurrency(balanceData?.[accountCode] || 0, balanceData?.currency),
        formValues: { selectedMonth: parseInt(month, 10), selectedYear: parseInt(year, 10) },
        monthOptions: moment.months().map((m, i) => ({ value: i, text: m })),
        prisoner: {
          nameForBreadcrumb: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
          name: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
          offenderNo,
        },
        showDamageObligationsLink: balanceData?.damageObligations > 0,
        yearOptions: yearOptions.map(yyyy => ({ value: yyyy, text: yyyy })),
      },
    }
  }

  return {
    getPrisonerFinanceData,
  }
}
