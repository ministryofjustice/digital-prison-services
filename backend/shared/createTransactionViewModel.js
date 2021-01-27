const { formatCurrency, formatTimestampToDate } = require('../utils')

module.exports = (transactions, prisons, showBalance = true) =>
  transactions.map(transaction => {
    const { description: prisonName } = prisons.find(agency => transaction.agencyId === agency.agencyId)
    const { penceAmount, currentBalance } = transaction

    return [
      { text: transaction.entryDate && formatTimestampToDate(transaction.entryDate) },
      { text: transaction.postingType === 'CR' ? formatCurrency(penceAmount / 100) : '' },
      { text: transaction.postingType === 'DR' ? formatCurrency(penceAmount / 100) : '' },
      ...(showBalance ? [{ text: formatCurrency(currentBalance / 100) }] : []),
      { text: transaction.entryDescription },
      { text: prisonName },
    ]
  })
