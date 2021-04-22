const { alertFlagLabels, cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst, formatLocation } = require('../../utils')

module.exports = ({ prisonApi }) => async (req, res) => {
  const {
    user: { activeCaseLoad },
  } = res.locals
  const { keywords } = req.query

  if (!keywords) {
    const firstCall = keywords === undefined
    const noKeywordError = {
      href: '#keywords',
      html: 'Enter a prisoner&#8217;s name or number',
    }
    return res.render('cellMove/cellMovePrisonerSearch.njk', {
      hasSearched: false,
      errors: firstCall ? [] : [noKeywordError],
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

  const prisoners = await prisonApi.getInmates(context, currentUserCaseLoad, {
    keywords,
    returnAlerts: 'true',
  })

  const results =
    prisoners &&
    prisoners.map(prisoner => ({
      ...prisoner,
      assignedLivingUnitDesc: formatLocation(prisoner.assignedLivingUnitDesc),
      name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
      alerts: alertFlagLabels.filter(alertFlag =>
        alertFlag.alertCodes.some(
          alert => prisoner.alertsDetails?.includes(alert) && cellMoveAlertCodes.includes(alert)
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
