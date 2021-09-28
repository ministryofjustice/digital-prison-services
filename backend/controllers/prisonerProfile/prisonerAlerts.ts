import moment from 'moment'
import { formatName } from '../../utils'

export default ({ prisonerProfileService, referenceCodesService, paginationService, prisonApi, oauthApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const { fromDate, toDate, alertType, active, pageOffsetOption } = req.query
    const from = (fromDate && moment(fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD')) || ''
    const to = (toDate && moment(toDate, 'DD/MM/YYYY').format('YYYY-MM-DD')) || ''
    const size = 20
    const pageOffset = parseInt(pageOffsetOption, 10) || 0
    const page = pageOffset / size
    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

    const { bookingId } = await prisonApi.getDetails(res.locals, offenderNo)

    const [prisonerProfileData, alertTypes, roles] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      referenceCodesService.getAlertTypes(res.locals),
      oauthApi.userRoles(res.locals),
    ])
    const { userCanEdit } = prisonerProfileData
    const canUpdateAlerts = roles && roles.some((role) => role.roleCode === 'UPDATE_ALERT') && userCanEdit
    const alerts = await prisonApi.getAlertsForBookingV2(res.locals, {
      bookingId,
      alertType: alertType || '',
      from,
      to,
      alertStatus: active || 'ACTIVE',
      page,
      sort: 'dateCreated,desc',
      size,
    })
    const totalAlerts = alerts.totalElements

    const activeAlerts = alerts.content
      .filter((alert) => alert.active && !alert.expired)
      .map((alert) => [
        { text: `${alert.alertTypeDescription} (${alert.alertType})` },
        { text: `${alert.alertCodeDescription} (${alert.alertCode})` },
        { text: alert.comment || 'None', classes: 'clip-overflow' },
        { text: moment(alert.dateCreated, 'YYYY-MM-DD').format('D MMMM YYYY') },
        { text: `${formatName(alert.addedByFirstName, alert.addedByLastName)}` },
        {
          html: canUpdateAlerts
            ? `<a class="govuk-button govuk-button--secondary" href="/edit-alert?offenderNo=${offenderNo}&alertId=${alert.alertId}">Change or close</a>`
            : '',
          classes: 'govuk-table__cell--numeric',
        },
      ])
    const inactiveAlerts = alerts.content
      .filter((alert) => !alert.active && alert.expired)
      .map((alert) => [
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
      ])

    const alertTypeValues =
      (alertTypes &&
        alertTypes.alertTypes &&
        alertTypes.alertTypes
          .filter((type) => type.activeFlag === 'Y')
          .map((type) => ({ value: type.value, text: type.description }))
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
      pagination: paginationService.getPagination(totalAlerts, pageOffset, size, fullUrl),
      createLink: `/offenders/${offenderNo}/create-alert`,
      canUpdateAlerts,
    })
  }
