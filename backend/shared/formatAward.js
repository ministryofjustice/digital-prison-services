const { formatTimestampToDate, formatCurrency } = require('../utils')

const pluraliseDay = days => (days > 1 ? 'days' : 'day')
const pluraliseMonth = months => (months > 1 ? 'months' : 'month')

const durationText = award => {
  if (award.months && award.days) {
    return `${award.months} ${pluraliseMonth(award.months)} and ${award.days} ${pluraliseDay(award.days)}`
  }

  return (
    (award.months && `${award.months} ${pluraliseMonth(award.months)}`) ||
    (award.days && `${award.days} ${pluraliseDay(award.days)}`)
  )
}

const descriptionWithLimit = award => {
  switch (award.sanctionCode) {
    case 'STOP_PCT': {
      return `${award.sanctionCodeDescription.replace('(%)', '').trim()} (${award.limit}%)`
    }

    case 'STOP_EARN': {
      return `${award.sanctionCodeDescription.replace('(amount)', '').trim()} (${formatCurrency(award.limit)})`
    }

    default:
      return award.sanctionCodeDescription
  }
}

module.exports = award => ({
  ...award,
  sanctionCodeDescription: descriptionWithLimit(award),
  effectiveDate: formatTimestampToDate(award.effectiveDate),
  durationText: durationText(award),
})
