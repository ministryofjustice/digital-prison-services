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

    const activeObligations = obligations.filter(obligation => obligation.status === 'ACTIVE')
    const totalOwed = activeObligations.reduce(
      (total, current) => total + (current.amountToPay - current.amountPaid),
      0
    )
    const prisons = await Promise.all(
      activeObligations.map(obligation => prisonApi.getAgencyDetails(res.locals, obligation.prisonId))
    )

    const rows = activeObligations
      .sort((left, right) => sortByDateTime(right.startDateTime, left.startDateTime))
      .map(obligation => {
        const { description: prisonName } = prisons.find(prison => prison.agencyId === obligation.prisonId)
        const { amountToPay, amountPaid, comment } = obligation

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
          { text: formatCurrency(amountToPay - amountPaid) },
          { text: comment ? `${prisonName} - ${comment}` : prisonName },
        ]
      })

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
    res.status(500)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
  }
}
