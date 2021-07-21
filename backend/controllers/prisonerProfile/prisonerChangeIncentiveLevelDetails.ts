import { putLastNameFirst, formatName } from '../../utils'
import { raiseAnalyticsEvent } from '../../raiseAnalyticsEvent'

export default ({ prisonApi }) => {
  const renderTemplate = async (req, res, pageData) => {
    const { offenderNo } = req.params
    const { errors, formValues = {} } = pageData || {}

    try {
      const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo)
      const { agencyId, bookingId, firstName, lastName } = prisonerDetails

      const [iepSummary, iepLevels] = await Promise.all([
        prisonApi.getIepSummaryForBooking(res.locals, bookingId, true),
        prisonApi.getAgencyIepLevels(res.locals, agencyId),
      ])

      const { iepLevel } = iepSummary
      const selectableLevels = iepLevels.map((level) => ({
        text: level.iepDescription,
        value: level.iepLevel,
        checked: level.iepLevel === formValues.newIepLevel,
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

  // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
  const index = async (req, res) => renderTemplate(req, res)

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const errors = []

    const { agencyId, bookingId, iepLevel, newIepLevel, reason } = req.body || {}

    if (!newIepLevel) {
      errors.push({ text: 'Select an incentive level', href: '#newIepLevel' })
    }

    if (!reason) {
      errors.push({ text: 'Enter a reason for your selected incentive label', href: '#reason' })
    }

    if (reason && reason.length > 240) {
      errors.push({ text: 'The reason must be 240 characters or less', href: '#reason' })
    }

    if (errors.length > 0) {
      return renderTemplate(req, res, { errors, formValues: { newIepLevel, reason } })
    }

    try {
      await prisonApi.changeIepLevel(res.locals, bookingId, {
        iepLevel: newIepLevel,
        comment: reason,
      })

      raiseAnalyticsEvent(
        'Update Incentive level',
        `Level changed from ${iepLevel} to ${newIepLevel} at ${agencyId}`,
        `Incentive level change`
      )

      return res.redirect(`/prisoner/${offenderNo}/incentive-level-details`)
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
