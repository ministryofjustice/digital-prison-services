import { alertFlagLabels, cellMoveAlertCodes } from '../../shared/alertFlagValues'
import { putLastNameFirst, formatLocation, formatName } from '../../utils'

export default ({ systemOauthClient, prisonApi }) =>
  async (req, res) => {
    const {
      user: { activeCaseLoad },
    } = res.locals
    const { keywords } = req.query

    if (!keywords) {
      const hasSearched = keywords !== undefined
      const emptySearchError = {
        href: '#keywords',
        text: 'Enter a prisoner’s name or number',
      }
      return res.render('cellMove/cellMovePrisonerSearch.njk', {
        showResults: false,
        errors: hasSearched ? [emptySearchError] : [],
      })
    }

    const currentUserCaseLoad = activeCaseLoad && activeCaseLoad.caseLoadId

    const systemContext = await systemOauthClient.getClientCredentialsTokens()
    const context = {
      ...systemContext,
      requestHeaders: {
        'Page-Limit': '5000',
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
      prisoners.map((prisoner) => ({
        ...prisoner,
        assignedLivingUnitDesc: formatLocation(prisoner.assignedLivingUnitDesc),
        name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
        formattedName: formatName(prisoner.firstName, prisoner.lastName),
        alerts: alertFlagLabels.filter((alertFlag) =>
          alertFlag.alertCodes.some(
            (alert) => prisoner.alertsDetails?.includes(alert) && cellMoveAlertCodes.includes(alert)
          )
        ),
        cellHistoryUrl: `/prisoner/${prisoner.offenderNo}/cell-history`,
        cellSearchUrl: `/prisoner/${prisoner.offenderNo}/cell-move/search-for-cell?returnUrl=/change-someones-cell`,
      }))

    return res.render('cellMove/cellMovePrisonerSearch.njk', {
      showResults: true,
      formValues: { ...req.query },
      results,
      totalOffenders: results.length,
    })
  }
