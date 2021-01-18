const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst, formatName } = require('../../utils')
const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ prisonApi, logError }) => {
  const renderError = (req, res, error) => {
    const { offenderNo } = req.params
    logError(req.originalUrl, error, serviceUnavailableMessage)
    res.status(500)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
  }

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
      const selectableLevels = iepLevels
        .filter(level => level.iepDescription !== iepLevel)
        .sort((a, b) => a.iepDescription.localeCompare(b.iepDescription))
        .map(level => ({
          text: level.iepDescription,
          value: level.iepLevel,
          checked: level.iepLevel === formValues.newIepLevel,
        }))

      return res.render('prisonerProfile/prisonerChangeIncentiveLevelDetails.njk', {
        agencyId,
        bookingId,
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        errors,
        dpsUrl,
        iepLevel,
        formValues,
        offenderNo,
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}`,
        selectableLevels,
      })
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const index = async (req, res) => renderTemplate(req, res)

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const errors = []

    const { agencyId, bookingId, iepLevel, newIepLevel, reason } = req.body || {}

    if (!newIepLevel) {
      errors.push({ text: 'Select a level', href: '#newIepLevel' })
    }

    if (!reason) {
      errors.push({ text: 'Enter reason for incentive level change', href: '#reason' })
    }

    if (reason && reason.length > 240) {
      errors.push({ text: 'Reason must be 240 characters or less', href: '#reason' })
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
      return renderError(req, res, error)
    }
  }

  return {
    index,
    post,
  }
}
