import { Request, Response } from 'express'
import { putLastNameFirst, formatLocation, formatName } from '../../utils'

export default ({ systemOauthClient, prisonApi }) =>
  async (req: Request, res: Response) => {
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
      return res.render('cellMove/cellMoveTemporaryMove.njk', {
        showResults: false,
        showHelp: !hasSearched,
        errors: hasSearched ? [emptySearchError] : [],
      })
    }

    const currentUserCaseLoad = activeCaseLoad && activeCaseLoad.caseLoadId

    const systemContext = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)
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
    })

    const results =
      prisoners &&
      prisoners.map((prisoner) => ({
        ...prisoner,
        assignedLivingUnitDesc: formatLocation(prisoner.assignedLivingUnitDesc),
        name: putLastNameFirst(prisoner.firstName, prisoner.lastName),
        formattedName: formatName(prisoner.firstName, prisoner.lastName),
        cellHistoryUrl: `/prisoner/${prisoner.offenderNo}/cell-history`,
        cellMoveUrl: `/prisoner/${prisoner.offenderNo}/cell-move/confirm-cell-move?cellId=C-SWAP`,
      }))

    return res.render('cellMove/cellMoveTemporaryMove.njk', {
      showResults: true,
      showHelp: false,
      formValues: { ...req.query },
      results,
      totalOffenders: results.length,
    })
  }
