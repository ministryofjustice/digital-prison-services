import moment from 'moment'
import { formatName } from '../../utils'
import getContext from './prisonerProfileContext'

export default ({
    prisonerProfileService,
    referenceCodesService,
    paginationService,
    prisonApi,
    oauthApi,
    systemOauthClient,
    restrictedPatientApi,
  }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    const { context, restrictedPatientDetails } = await getContext({
      offenderNo,
      res,
      req,
      oauthApi,
      systemOauthClient,
      restrictedPatientApi,
    })

    const { fromDate, toDate, alertType, active, pageOffsetOption } = req.query
    const from = (fromDate && moment(fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD')) || ''
    const to = (toDate && moment(toDate, 'DD/MM/YYYY').format('YYYY-MM-DD')) || ''
    const size = 20
    const pageOffset = parseInt(pageOffsetOption, 10) || 0
    const page = pageOffset / size
    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    const { username } = req.session.userDetails

    const { bookingId } = await prisonApi.getDetails(context, offenderNo)
    const roles = oauthApi.userRoles(context)
    const [prisonerProfileData, alertTypes] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(context, offenderNo, username, restrictedPatientDetails),
      referenceCodesService.getAlertTypes(context),
    ])
    const { userCanEdit } = prisonerProfileData
    const canUpdateAlerts = roles && roles.some((role) => role.roleCode === 'UPDATE_ALERT') && userCanEdit
    const alerts = await prisonApi.getAlertsForBookingV2(context, {
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
