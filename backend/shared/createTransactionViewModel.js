const { formatCurrency, formatTimestampToDate } = require('../utils')

module.exports = (transactions, prisons, showBalance = true, mergeAmounts = false) =>
  transactions.map(transaction => {
    const { description: prisonName } = prisons.find(agency => transaction.agencyId === agency.agencyId)
    const { penceAmount, currentBalance } = transaction

    const amount = (typeof penceAmount === 'number' && penceAmount / 100) || ''

    return [
      { text: transaction.entryDate && formatTimestampToDate(transaction.entryDate) },
      ...(mergeAmounts
        ? [{ text: formatCurrency(amount) }]
        : [
            { text: transaction.postingType === 'CR' ? formatCurrency(amount) : '' },
            { text: transaction.postingType === 'DR' ? formatCurrency(amount) : '' },
          ]),
      ...(showBalance ? [{ text: formatCurrency(currentBalance / 100) }] : []),
      { text: transaction.entryDescription },
      { text: prisonName },
    ]
  })
