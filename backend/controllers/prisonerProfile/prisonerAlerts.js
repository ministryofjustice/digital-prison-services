const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { formatName } = require('../../utils')

module.exports = ({
  prisonerProfileService,
  referenceCodesService,
  paginationService,
  elite2Api,
  oauthApi,
  logError,
}) => async (req, res) => {
  const { offenderNo } = req.params
  const { fromDate, toDate, alertType, active, pageOffsetOption } = req.query
  const fomattedFromDate = fromDate && moment(fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
  const fomattedToDate = toDate && moment(toDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
  const pageLimit = 20
  const pageOffset = parseInt(pageOffsetOption, 10) || 0
  const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

  try {
    const { bookingId } = await elite2Api.getDetails(res.locals, offenderNo)

    const alertTypeQuery = type => (type ? `alertType:in:'${type}'` : '')
    const fromQuery = date => (date ? `dateCreated:gteq:DATE'${date}'` : '')
    const toQuery = date => (date ? `dateCreated:lteq:DATE'${date}'` : '')
    const activeQuery = activeFlag => (activeFlag ? `active:eq:'${activeFlag}'` : "active:eq:'ACTIVE'")

    const queryParts = [
      alertTypeQuery(alertType),
      fromQuery(fomattedFromDate),
      toQuery(fomattedToDate),
      activeQuery(active),
    ]
      .filter(value => value)
      .join(',and:')

    const query = queryParts ? `?query=${queryParts}` : ''

    const headers = {
      'Sort-Order': 'DESC',
      'Sort-Fields': 'dateCreated',
      'Page-Offset': pageOffset,
      'Page-Limit': pageLimit,
    }

    const [prisonerProfileData, alertTypes, roles] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      referenceCodesService.getAlertTypes(res.locals),
      oauthApi.userRoles(res.locals),
    ])
    const { userCanEdit } = prisonerProfileData
    const canUpdateAlerts = roles && roles.some(role => role.roleCode === 'UPDATE_ALERT') && userCanEdit
    const alerts = await elite2Api.getAlertsForBooking(res.locals, { bookingId, query }, headers)
    const totalAlerts = res.locals.responseHeaders['total-records']

    const activeAlerts = alerts.filter(alert => alert.active && !alert.expired).map(alert => {
      return [
        { text: `${alert.alertTypeDescription} (${alert.alertType})` },
        { text: `${alert.alertCodeDescription} (${alert.alertCode})` },
        { text: alert.comment || 'None', classes: 'clip-overflow' },
        { text: moment(alert.dateCreated, 'YYYY-MM-DD').format('D MMMM YYYY') },
        { text: `${formatName(alert.addedByFirstName, alert.addedByLastName)}` },
        {
          html: canUpdateAlerts
            ? `<a class="govuk-button govuk-button--secondary" href="/edit-alert?offenderNo=${offenderNo}&alertId=${
                alert.alertId
              }">Change or close</a>`
            : '',
          classes: 'govuk-table__cell--numeric',
        },
      ]
    })
    const inactiveAlerts = alerts.filter(alert => !alert.active && alert.expired).map(alert => {
      return [
        { text: `${alert.alertTypeDescription} (${alert.alertType})` },
        { text: `${alert.alertCodeDescription} (${alert.alertCode})` },
        { text: alert.comment || 'None', classes: 'clip-overflow' },
        {
          html: `${moment(alert.dateCreated, 'YYYY-MM-DD').format('D MMMM YYYY')}<br>${moment(
            alert.dateExpires,
            'YYYY-MM-DD'
          ).format('D MMMM YYYY')}`,
        },
        {
          html: `${formatName(alert.addedByFirstName, alert.addedByLastName)}<br>${formatName(
            alert.expiredByFirstName,
            alert.expiredByLastName
          )}`,
        },
      ]
    })

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
      active,
      activeAlerts,
      inactiveAlerts,
      alertTypeValues,
      pagination: paginationService.getPagination(totalAlerts, pageOffset, pageLimit, fullUrl),
      createLink: `/offenders/${offenderNo}/create-alert`,
      canUpdateAlerts,
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}/alerts` })
  }
}
