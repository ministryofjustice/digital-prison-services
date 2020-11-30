const moment = require('moment')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../../config')
const {
  formatCurrency,
  formatTimestampToDate,
  putLastNameFirst,
  formatName,
  sortByDateTime,
} = require('../../../utils')

module.exports = ({ prisonApi, logError }) => async (req, res) => {
  const { month, year } = req.query
  const { offenderNo } = req.params

  const fromDate = moment()
    .set({ date: 1, month, year })
    .format('YYYY-MM-DD')

  try {
    const [privateCashTransactions, prisonerDetails] = await Promise.all([
      prisonApi.getTransactionHistory(res.locals, offenderNo, { from_date: fromDate, account_code: 'cash' }),
      prisonApi.getDetails(res.locals, offenderNo),
    ])
    const balanceData = await prisonApi.getPrisonerBalances(res.locals, prisonerDetails.bookingId)

    const uniqueAgencyIds = [...new Set(privateCashTransactions.map(transaction => transaction.agencyId))]
    const prisons = await Promise.all(uniqueAgencyIds.map(agencyId => prisonApi.getAgencyDetails(res.locals, agencyId)))

    const pendingTransactions = privateCashTransactions.filter(transaction => transaction.transactionType === 'HOA')
    const nonPendingTransactions = privateCashTransactions.filter(transaction => transaction.transactionType !== 'HOA')

    const createTransactionViewModel = transactions =>
      transactions.map(transaction => {
        const { description: prisonName } = prisons.find(agency => transaction.agencyId === agency.agencyId)
        const { currency, penceAmount } = transaction

        return [
          { text: transaction.entryDate && formatTimestampToDate(transaction.entryDate) },
          { text: transaction.postingType === 'CR' ? formatCurrency(penceAmount / 100, currency) : '' },
          { text: transaction.postingType === 'DR' ? formatCurrency(penceAmount / 100, currency) : '' },
          { text: 'balance' },
          { text: transaction.entryDescription },
          { text: prisonName },
        ]
      })

    // const rows = privateCashTransactions.map(transaction => {
    //   const { description: prisonName } = prisons.find(agency => transaction.agencyId === agency.agencyId)
    //   const { currency, penceAmount } = transaction

    //   return [
    //     { text: transaction.entryDate && formatTimestampToDate(transaction.entryDate) },
    //     { text: transaction.postingType === 'CR' ? formatCurrency(penceAmount / 100, currency) : '' },
    //     { text: transaction.postingType === 'DR' ? formatCurrency(penceAmount / 100, currency) : '' },
    //     { text: 'balance' },
    //     { text: transaction.entryDescription },
    //     { text: prisonName },
    //   ]
    // })

    return res.render('prisonerProfile/prisonerFinance/privateCash.njk', {
      currentBalance: formatCurrency(balanceData?.cash || 0, balanceData?.currency),
      dpsUrl,
      prisoner: {
        nameForBreadcrumb: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
        name: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
        offenderNo,
      },
      rows: createTransactionViewModel(nonPendingTransactions)
    })
  } catch (error) {
    console.log({ error })
    logError(req.originalUrl, error, 'Private cash page - Prisoner finances')
    return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
  }
}
