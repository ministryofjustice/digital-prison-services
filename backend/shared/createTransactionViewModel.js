const { formatCurrency, formatTimestampToDate } = require('../utils')

module.exports = (transactions, prisons, showBalance = true, mergeAmounts = false) =>
  transactions.map(transaction => {
    const { description: prisonName } = prisons.find(agency => transaction.agencyId === agency.agencyId)
    const { penceAmount, currentBalance } = transaction

    const formattedAmount = formatCurrency(typeof penceAmount === 'number' ? penceAmount / 100 : '')
    const formattedCurrentBalance = formatCurrency(typeof currentBalance === 'number' ? currentBalance / 100 : '')

    return [
      { text: transaction.entryDate && formatTimestampToDate(transaction.entryDate) },
      ...(mergeAmounts
        ? [{ text: formattedAmount }]
        : [
            { text: transaction.postingType === 'CR' ? formattedAmount : '' },
            { text: transaction.postingType === 'DR' ? formattedAmount : '' },
          ]),
      ...(showBalance ? [{ text: formattedCurrentBalance }] : []),
      { text: transaction.entryDescription },
      { text: prisonName },
    ]
  })
