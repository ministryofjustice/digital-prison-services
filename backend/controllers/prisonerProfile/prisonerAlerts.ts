import moment from 'moment'
import getContext from './prisonerProfileContext'

export default ({
    prisonerProfileService,
    referenceCodesService,
    paginationService,
    prisonerAlertsApi,
    oauthApi,
    systemOauthClient,
    restrictedPatientApi,
  }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    const { context, overrideAccess } = await getContext({
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

    const roles = oauthApi.userRoles(context)
    const systemContext = await systemOauthClient.getClientCredentialsTokens(username)
    const [prisonerProfileData, alertTypes] = await Promise.all([
      prisonerProfileService.getPrisonerProfileData(context, offenderNo, username, overrideAccess),
      referenceCodesService.getAlertTypes(systemContext),
    ])
    const { userCanEdit } = prisonerProfileData
    const canUpdateAlerts = roles && roles.some((role) => role.roleCode === 'UPDATE_ALERT') && userCanEdit

    const alerts = await prisonerAlertsApi.getAlertsForPrisonNumber(systemContext, {
      prisonNumber: offenderNo,
      alertType: alertType || '',
      from,
      to,
      isActive: (active || 'ACTIVE') === 'ACTIVE',
      page,
      sort: 'createdAt,desc',
      size,
    })
    const totalAlerts = alerts.totalElements

    const activeAlerts = alerts.content
      .filter((alert) => alert.isActive)
      .map((alert) => [
        { text: `${alert.alertCode.alertTypeDescription} (${alert.alertCode.alertTypeCode})` },
        { text: `${alert.alertCode.description} (${alert.alertCode.code})` },
        { text: alert.description || 'None', classes: 'clip-overflow' },
        { text: moment(alert.createdAt, 'YYYY-MM-DD').format('D MMMM YYYY') },
        { text: alert.createdByDisplayName },
        {
          html: canUpdateAlerts
            ? `<a class="govuk-button govuk-button--secondary" href="/edit-alert?offenderNo=${offenderNo}&alertId=${alert.alertId}">Change or close</a>`
            : '',
          classes: 'govuk-table__cell--numeric',
        },
      ])
    const inactiveAlerts = alerts.content
      .filter((alert) => !alert.isActive)
      .map((alert) => [
        { text: `${alert.alertCode.alertTypeDescription} (${alert.alertCode.alertTypeCode})` },
        { text: `${alert.alertCode.description} (${alert.alertCode.code})` },
        { text: alert.description || 'None', classes: 'clip-overflow' },
        {
          html: `${moment(alert.createdAt, 'YYYY-MM-DD').format('D MMMM YYYY')}<br>${moment(
            alert.activeTo,
            'YYYY-MM-DD'
          ).format('D MMMM YYYY')}`,
        },
        {
          html: `${alert.createdByDisplayName}<br>${alert.activeToLastSetByDisplayName}`,
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
