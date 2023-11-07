import moment from 'moment'
import config from '../../config'
import type apis from '../../apis'
import type systemOauthClients from '../../api/systemOauthClient'
import type { IepSummaryForBooking } from '../../api/incentivesApi'
import { putLastNameFirst, formatName } from '../../utils'
import { raiseAnalyticsEvent } from '../../raiseAnalyticsEvent'

export default ({
  prisonApi,
  incentivesApi,
  systemOauthClient,
}: {
  prisonApi: typeof apis.prisonApi
  incentivesApi: typeof apis.incentivesApi
  systemOauthClient: typeof systemOauthClients
}) => {
  const renderTemplate = async (req, res, pageData) => {
    const { offenderNo } = req.params
    const { errors, formValues = {} } = pageData || {}
    const systemContext = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)
    try {
      const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo)
      const { agencyId, bookingId, firstName, lastName } = prisonerDetails

      const [iepSummary, prisonIncentiveLevels] = await Promise.all([
        getCurrentIepLevel(systemContext, bookingId),
        incentivesApi.getPrisonIncentiveLevels(systemContext, agencyId),
      ])

      const { iepLevel } = iepSummary
      const selectableLevels = prisonIncentiveLevels.map((level) => ({
        text: iepLevel === level.levelName ? `${level.levelName} (current level)` : level.levelName,
        value: level.levelCode,
        checked: level.levelCode === formValues.newIepLevel,
      }))

      return res.render('prisonerProfile/prisonerChangeIncentiveLevelDetails.njk', {
        agencyId,
        bookingId,
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        errors,
        iepLevel,
        formValues,
        offenderNo,
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}`,
        selectableLevels,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }

  const getCurrentIepLevel = async (systemContext, bookingId): Promise<IepSummaryForBooking> => {
    let currentLevel
    try {
      currentLevel = await incentivesApi.getIepSummaryForBooking(systemContext, bookingId)
    } catch (error) {
      if (error.response.status === 404) {
        currentLevel = { iepLevel: 'Not entered' }
      }
    }
    return currentLevel
  }

  const renderConfirmation = async (req, res) => {
    const { offenderNo } = req.params

    try {
      const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo, true)
      const { agencyId, bookingId, firstName, lastName, assignedLivingUnit } = prisonerDetails
      const locationId: string | undefined = assignedLivingUnit?.description
      const systemContext = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)
      const iepSummary = await incentivesApi.getIepSummaryForBooking(systemContext, bookingId)
      const nextReviewDate = iepSummary?.nextReviewDate && moment(iepSummary.nextReviewDate, 'YYYY-MM-DD HH:mm')

      return res.render('prisonerProfile/prisonerChangeIncentiveLevelConfirmation.njk', {
        agencyId,
        bookingId,
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        offenderNo,
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}`,
        manageIncentivesUrl:
          agencyId && locationId && locationId.includes('-')
            ? `${config.apis.incentives.ui_url}/incentive-summary/${agencyId}-${locationId.split('-')[0]}`
            : config.apis.incentives.ui_url,
        iepSummary,
        nextReviewDate: nextReviewDate?.format('D MMMM YYYY'),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}/incentive-level-details`
      throw error
    }
  }

  const index = async (req, res) => renderTemplate(req, res, undefined)

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const errors = []

    const { agencyId, bookingId, iepLevel, newIepLevel, reason } = req.body || {}

    if (!newIepLevel) {
      errors.push({ text: 'Select an incentive level, even if it is the same as before', href: '#newIepLevel' })
    }

    if (!reason) {
      errors.push({ text: 'Enter a reason for recording', href: '#reason' })
    }

    if (reason && reason.length > 240) {
      errors.push({ text: 'Comments must be 240 characters or less', href: '#reason' })
    }

    if (errors.length > 0) {
      return renderTemplate(req, res, { errors, formValues: { newIepLevel, reason } })
    }
    const systemContext = await systemOauthClient.getClientCredentialsTokens(req.session.userDetails.username)
    try {
      await incentivesApi.changeIepLevel(systemContext, bookingId, {
        iepLevel: newIepLevel,
        comment: reason,
      })

      raiseAnalyticsEvent(
        'Update Incentive level',
        `Level changed from ${iepLevel} to ${newIepLevel} at ${agencyId}`,
        'Incentive level change'
      )

      return renderConfirmation(req, res)
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }

  return {
    index,
    post,
  }
}
