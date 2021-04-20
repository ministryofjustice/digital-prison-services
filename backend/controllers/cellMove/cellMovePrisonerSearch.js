const { alertFlagLabels, cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst, formatLocation } = require('../../utils')

module.exports = ({ prisonApi }) => async (req, res) => {
  const {
    user: { activeCaseLoad },
  } = res.locals
  const { keywords } = req.query

  if (!keywords) {
    return res.render('cellMove/cellMovePrisonerSearch.njk', {
      hasSearched: false,
    })
  }

  const currentUserCaseLoad = activeCaseLoad && activeCaseLoad.caseLoadId

  const context = {
    ...res.locals,
    requestHeaders: {
      'Sort-Fields': 'lastName,firstName',
      'Sort-Order': 'ASC',
    },
  }

  const [prisoners] = await Promise.all([
    prisonApi.getInmates(context, currentUserCaseLoad, {
      keywords,
      returnAlerts: 'true',
    }),
  ])

  const results =
    prisoners &&
    prisoners.map(prisoner => ({
      ...prisoner,
      assignedLivingUnitDesc: formatLocation(prisoner.assignedLivingUnitDesc),
      name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
      alerts: alertFlagLabels.filter(alertFlag =>
        alertFlag.alertCodes.some(
          alert =>
            prisoner.alertsDetails && prisoner.alertsDetails.includes(alert) && cellMoveAlertCodes.includes(alert)
        )
      ),
      cellHistoryUrl: `/prisoner/${prisoner.offenderNo}/cell-history`,
      cellSearchUrl: `/prisoner/${prisoner.offenderNo}/cell-move/search-for-cell`,
    }))

  return res.render('cellMove/cellMovePrisonerSearch.njk', {
    hasSearched: true,
    formValues: { ...req.query },
    results,
    totalOffenders: results.length,
  })
}
