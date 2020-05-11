const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst } = require('../../utils')

module.exports = ({ prisonerProfileService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const details = await elite2Api.getDetails(res.locals, offenderNo)
    const { bookingId } = details || {}

    const [prisonerProfileData, alerts] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getAlertsForBooking(res.locals, bookingId),
    ])

    const activeAlerts = alerts.filter(alert => alert.active && !alert.expired).map(alert => {
      return [
        { text: alert.alertTypeDescription },
        { text: alert.alertCodeDescription },
        { text: alert.comment || 'None' },
        { text: moment(alert.dateCreated, 'YYYY-MM-DD').format('DD/MM/YYYY') },
        { text: `${putLastNameFirst(alert.addedByFirstName, alert.addedByLastName)}` },
        {
          html: `<a class="govuk-button-secondary" href="/edit-alert?offenderNo=${offenderNo}&alertId=${
            alert.alertId
          }">Edit or close</a>`,
        },
      ]
    })
    const inactiveAlerts = alerts.filter(alert => !alert.active && alert.expired).map(alert => {
      return [
        { text: alert.alertTypeDescription },
        { text: alert.alertCodeDescription },
        { text: alert.comment || 'None' },
        {
          html: `${moment(alert.dateCreated, 'YYYY-MM-DD').format('DD/MM/YYYY')}<br>${moment(
            alert.dateExpires,
            'YYYY-MM-DD'
          ).format('DD/MM/YYYY')}`,
        },
        {
          html: `${putLastNameFirst(alert.addedByFirstName, alert.addedByLastName)}<br>${putLastNameFirst(
            alert.expiredByFirstName,
            alert.expiredByLastName
          )}`,
        },
      ]
    })

    return res.render('prisonerProfile/prisonerAlerts.njk', {
      prisonerProfileData,
      activeAlerts,
      inactiveAlerts,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}/alerts` })
  }
}
