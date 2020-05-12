const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst } = require('../../utils')

module.exports = ({ prisonerProfileService, referenceCodesService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { fromDate, toDate, alertType } = req.query
  const fomattedFromDate = fromDate && moment(fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
  const fomattedToDate = toDate && moment(toDate, 'DD/MM/YYYY').format('YYYY-MM-DD')

  try {
    const { bookingId } = await elite2Api.getDetails(res.locals, offenderNo)

    const alertTypeQuery = type => (type ? `alertType:in:'${type}'` : '')
    const fromQuery = date => (date ? `dateCreated:gteq:DATE'${date}'` : '')
    const toQuery = date => (date ? `dateCreated:lteq:DATE'${date}'` : '')

    const queryParts = [alertTypeQuery(alertType), fromQuery(fomattedFromDate), toQuery(fomattedToDate)]
      .filter(value => value)
      .join(',and:')

    const query = queryParts ? `?query=${queryParts}` : ''

    const [prisonerProfileData, alerts, alertTypes] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getAlertsForBooking(res.locals, { bookingId, query }),
      referenceCodesService.getAlertTypes(res.locals),
    ])

    const activeAlerts = alerts.filter(alert => alert.active && !alert.expired).map(alert => {
      return [
        { text: alert.alertTypeDescription },
        { text: alert.alertCodeDescription },
        { text: alert.comment || 'None' },
        { text: moment(alert.dateCreated, 'YYYY-MM-DD').format('DD/MM/YYYY') },
        { text: `${putLastNameFirst(alert.addedByFirstName, alert.addedByLastName)}` },
        {
          html: `<a class="govuk-button govuk-button--secondary" href="/edit-alert?offenderNo=${offenderNo}&alertId=${
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

    const totalAlerts = prisonerProfileData.activeAlertCount + prisonerProfileData.inactiveAlertCount

    const alertTypeValues =
      (alertTypes &&
        alertTypes.alertTypes &&
        alertTypes.alertTypes
          .filter(type => type.activeFlag === 'Y')
          .map(type => ({ value: type.value, text: type.description }))
          .sort((a, b) => a.description - b.description)) ||
      []

    return res.render('prisonerProfile/prisonerAlerts.njk', {
      prisonerProfileData,
      totalAlerts,
      alertType,
      fromDate,
      toDate,
      activeAlerts,
      inactiveAlerts,
      alertTypeValues,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}/alerts` })
  }
}
