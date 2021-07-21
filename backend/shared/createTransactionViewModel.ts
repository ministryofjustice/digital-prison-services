import { formatCurrency, formatTimestampToDate } from '../utils'

export default (transactions, prisons, showBalance = true, mergeAmounts = false) =>
  transactions.map((transaction) => {
    const { description: prisonName } = prisons.find((agency) => transaction.agencyId === agency.agencyId)
    const { penceAmount, currentBalance } = transaction

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const formattedMoneyIn = formatCurrency(typeof penceAmount === 'number' ? penceAmount / 100 : '')
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const formattedMoneyOut = formatCurrency(typeof penceAmount === 'number' ? (penceAmount / 100) * -1 : '')

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const formattedCurrentBalance = formatCurrency(typeof currentBalance === 'number' ? currentBalance / 100 : '')

    return [
      { text: transaction.entryDate && formatTimestampToDate(transaction.entryDate) },
      ...(mergeAmounts
        ? [{ text: formattedMoneyIn }]
        : [
            { text: transaction.postingType === 'CR' ? formattedMoneyIn : '' },
            { text: transaction.postingType === 'DR' ? formattedMoneyOut : '' },
          ]),
      ...(showBalance ? [{ text: formattedCurrentBalance }] : []),
      { text: transaction.entryDescription },
      { text: prisonName },
    ]
  })
