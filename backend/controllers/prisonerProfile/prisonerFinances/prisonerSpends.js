const moment = require('moment')
const { formatCurrency, formatTimestampToDate, putLastNameFirst, formatName } = require('../../../utils')

const createTransactionViewModel = (transactions, prisons) =>
  transactions.map(transaction => {
    const { description: prisonName } = prisons.find(agency => transaction.agencyId === agency.agencyId)
    const { penceAmount } = transaction

    return [
      { text: transaction.entryDate && formatTimestampToDate(transaction.entryDate) },
      { text: transaction.postingType === 'CR' ? formatCurrency(penceAmount / 100) : '' },
      { text: transaction.postingType === 'DR' ? formatCurrency(penceAmount / 100) : '' },
      { text: transaction.entryDescription },
      { text: prisonName },
    ]
  })

module.exports = ({ prisonApi }) => async (req, res) => {
  const today = moment()
  const currentYear = today.year()

  const { month = today.month(), year = today.year() } = req.query
  const { offenderNo } = req.params

  const noOfSelectableYears = 4
  const yearOptions = Array.from({ length: noOfSelectableYears }, (v, i) => currentYear - noOfSelectableYears + i + 1)

  const selectedMonthAndYear = moment().set({ month, year })

  const isCurrentMonthAndYear = selectedMonthAndYear.isSame(today, 'month', 'year')
  const isFutureMonthAndYear = selectedMonthAndYear.isAfter(today)

  try {
    const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo)

    const allTransactionsForDateRange = isFutureMonthAndYear
      ? []
      : await prisonApi.getTransactionHistory(res.locals, offenderNo, {
          from_date: selectedMonthAndYear.startOf('month').format('YYYY-MM-DD'),
          to_date: isCurrentMonthAndYear
            ? today.format('YYYY-MM-DD')
            : selectedMonthAndYear.endOf('month').format('YYYY-MM-DD'),
          account_code: 'spends',
        })

    const balanceData = await prisonApi.getPrisonerBalances(res.locals, prisonerDetails.bookingId)

    const uniqueAgencyIds = [...new Set(allTransactionsForDateRange.map(transaction => transaction.agencyId))]
    const prisons = await Promise.all(uniqueAgencyIds.map(agencyId => prisonApi.getAgencyDetails(res.locals, agencyId)))

    return res.render('prisonerProfile/prisonerFinance/spends.njk', {
      currentBalance: formatCurrency(balanceData?.spends || 0, balanceData?.currency),
      formValues: { selectedMonth: parseInt(month, 10), selectedYear: parseInt(year, 10) },
      monthOptions: moment.months().map((m, i) => ({ value: i, text: m })),
      prisoner: {
        nameForBreadcrumb: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
        name: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
        offenderNo,
      },
      spendsRows: createTransactionViewModel(allTransactionsForDateRange, prisons),
      showDamageObligationsLink: balanceData?.damageObligations > 0,
      yearOptions: yearOptions.map(yyyy => ({ value: yyyy, text: yyyy })),
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
