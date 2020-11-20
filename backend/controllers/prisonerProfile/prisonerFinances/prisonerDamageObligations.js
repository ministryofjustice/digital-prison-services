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
  const { offenderNo } = req.params

  try {
    const [damageObligations, prisonerDetails] = await Promise.all([
      prisonApi.getOffenderDamageObligations(res.locals, offenderNo),
      prisonApi.getDetails(res.locals, offenderNo),
    ])

    const { damageObligations: obligations } = damageObligations
    let totalOwed = 0

    const rows = await Promise.all(
      obligations
        .filter(obligation => obligation.status === 'ACTIVE')
        .sort((left, right) => sortByDateTime(right.startDateTime, left.startDateTime))
        .map(async obligation => {
          const { description: prisonName } = await prisonApi.getAgencyDetails(res.locals, obligation.prisonId)

          const { amountToPay, amountPaid, comment } = obligation

          const balanceRemaining = amountToPay - amountPaid

          totalOwed += balanceRemaining

          return [
            { text: obligation.id },
            { text: obligation.referenceNumber },
            {
              text: `${formatTimestampToDate(obligation.startDateTime)} to ${formatTimestampToDate(
                obligation.endDateTime
              )}`,
            },
            { text: formatCurrency(amountToPay) },
            { text: formatCurrency(amountPaid) },
            { text: formatCurrency(balanceRemaining) },
            { text: comment ? `${prisonName} - ${comment}` : prisonName },
          ]
        })
    )

    return res.render('prisonerProfile/prisonerFinance/damageObligations.njk', {
      dpsUrl,
      prisoner: {
        nameForBreadcrumb: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
        name: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
        offenderNo,
      },
      rows,
      totalOwed: formatCurrency(totalOwed),
    })
  } catch (error) {
    logError(req.originalUrl, error, 'Damage obligations page - Prisoner finances')
    return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
  }
}
