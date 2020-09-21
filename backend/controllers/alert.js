const moment = require('moment')
const nunjucks = require('nunjucks')
const { properCaseName, formatName } = require('../utils')
const { logError } = require('../logError')
const { raiseAnalyticsEvent } = require('../raiseAnalyticsEvent')
const { serviceUnavailableMessage } = require('../common-messages')

const getOffenderUrl = offenderNo => `/prisoner/${offenderNo}`

const getUpdateParameters = ({ comment, expiryDate }) => {
  if (comment && expiryDate) return { comment, expiryDate }
  if (comment && !expiryDate) return { comment }

  return { expiryDate }
}

const fireAnalyticsEvent = ({ closeAlert, alertCode, caseLoadId }) => {
  if (closeAlert) {
    raiseAnalyticsEvent('Alert Closed', `Alert closed for ${caseLoadId}`, `Alert type - ${alertCode}`)
  } else {
    raiseAnalyticsEvent('Alert comment updated', `Alert comment updated for ${caseLoadId}`, `Alert type - ${alertCode}`)
  }
}

const getValidationErrors = ({ alertStatus, comment }) => {
  const errors = []
  if (!alertStatus) {
    errors.push({
      text: 'Select yes if you want to close this alert',
      href: '#alertStatus',
    })
  }

  if (comment && comment.length > 1000) {
    errors.push({
      text: 'Enter a comment using 1000 characters or less',
      href: '#comment',
    })
  }

  if (!comment) {
    errors.push({
      text: 'Comment required',
      href: '#comment',
    })
  }
  return errors
}

const alertFactory = (oauthApi, elite2Api, referenceCodesService) => {
  const renderTemplate = (req, res, pageData) => {
    const { alert, pageErrors, offenderDetails, ...rest } = pageData
    const formAction = offenderDetails && alert && `/edit-alert/${offenderDetails.bookingId}/${alert.alertId}`

    const {
      active,
      alertCode,
      alertCodeDescription,
      alertId,
      alertType,
      alertTypeDescription,
      comment,
      dateCreated,
      expired,
      addedByFirstName,
      addedByLastName,
    } = alert || {}

    res.render('alerts/editAlertForm.njk', {
      errors: [...req.flash('errors'), ...pageErrors],
      offenderDetails,
      formAction,
      alert: alert && {
        active,
        alertCode,
        alertCodeDescription,
        alertId,
        alertType,
        alertTypeDescription,
        comment,
        expired,
        dateCreated: moment(dateCreated).format('D MMMM YYYY'),
        createdBy: formatName(addedByFirstName, addedByLastName),
      },
      ...rest,
    })
  }

  const displayEditAlertPage = async (req, res) => {
    const pageErrors = []

    try {
      const { offenderNo, alertId } = req.query
      const { bookingId, firstName, lastName, agencyId } = await elite2Api.getDetails(res.locals, offenderNo)

      const [alert, user, caseLoads, userRoles] = await Promise.all([
        elite2Api.getAlert(res.locals, bookingId, alertId),
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
      ])

      const canViewInactivePrisoner = userRoles && userRoles.some(role => role.roleCode === 'INACTIVE_BOOKINGS')
      const offenderInCaseload = caseLoads && caseLoads.some(caseload => caseload.caseLoadId === agencyId)
      const userCanEdit = (canViewInactivePrisoner && ['OUT', 'TRN'].includes(agencyId)) || offenderInCaseload

      if (!userRoles.some(role => role.roleCode === 'UPDATE_ALERT') || !userCanEdit) {
        return res.render('notFound.njk', { url: req.headers.referer || `/prisoner/${offenderNo}/alerts` })
      }

      const offenderDetails = {
        bookingId,
        offenderNo,
        profileUrl: getOffenderUrl(offenderNo),
        name: `${properCaseName(lastName)}, ${properCaseName(firstName)}`,
      }
      const activeCaseLoad = caseLoads.find(cl => cl.currentlyActive)

      if (alert && alert.expired) pageErrors.push({ text: 'This alert has already expired' })

      return renderTemplate(req, res, {
        alert: {
          ...alert,
          comment: req.flash('comment')[0] || alert.comment,
        },
        offenderDetails,
        pageErrors,
        user: {
          displayName: user.name,
          activeCaseLoad: {
            description: activeCaseLoad && activeCaseLoad.description,
          },
        },
        caseLoadId: activeCaseLoad && activeCaseLoad.caseLoadId,
        userRoles,
        homeUrl: `${getOffenderUrl(offenderNo)}/alerts`,
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      pageErrors.push({ text: serviceUnavailableMessage })
      return renderTemplate(req, res, { pageErrors })
    }
  }

  const handleEditAlertForm = async (req, res) => {
    const { bookingId, alertId } = req.params
    const { alertStatus, offenderNo, comment } = req.body
    const closeAlert = alertStatus === 'yes'
    const editAlert = closeAlert || Boolean(comment)

    const [alert, caseLoads] = await Promise.all([
      elite2Api.getAlert(res.locals, bookingId, alertId),
      elite2Api.userCaseLoads(res.locals),
    ])

    const activeCaseLoad = caseLoads.find(cl => cl.currentlyActive)
    const errors = getValidationErrors({ alertStatus, comment })

    if (errors.length > 0) {
      if (comment) req.flash('comment', comment)
      req.flash('errors', errors)
      return res.redirect('back')
    }

    if (editAlert) {
      try {
        await elite2Api.updateAlert(res.locals, bookingId, alertId, {
          ...getUpdateParameters({ comment, expiryDate: closeAlert && moment().format('YYYY-MM-DD') }),
        })

        fireAnalyticsEvent({ closeAlert, alertCode: alert.alertCode, caseLoadId: activeCaseLoad.caseLoadId })
      } catch (error) {
        logError(req.originalUrl, error, serviceUnavailableMessage)
        req.flash('errors', [{ text: serviceUnavailableMessage }])
        return res.redirect('back')
      }
    }

    return res.redirect(`${getOffenderUrl(offenderNo)}/alerts?alertStatus=${closeAlert ? 'closed' : 'open'}`)
  }

  const displayCreateAlertPage = async (req, res) => {
    const { offenderNo } = req.params
    try {
      const { bookingId, firstName, lastName, alerts, agencyId } = await elite2Api.getDetails(
        res.locals,
        offenderNo,
        true
      )
      const [userRoles, caseLoads] = await Promise.all([
        oauthApi.userRoles(res.locals),
        elite2Api.userCaseLoads(res.locals),
      ])

      const canViewInactivePrisoner = userRoles && userRoles.some(role => role.roleCode === 'INACTIVE_BOOKINGS')
      const offenderInCaseload = caseLoads && caseLoads.some(caseload => caseload.caseLoadId === agencyId)
      const userCanEdit = (canViewInactivePrisoner && ['OUT', 'TRN'].includes(agencyId)) || offenderInCaseload

      if (!userRoles.some(role => role.roleCode === 'UPDATE_ALERT') || !userCanEdit) {
        return res.render('notFound.njk', { url: req.headers.referer || `/prisoner/${offenderNo}/alerts` })
      }

      const alertTypes = await referenceCodesService.getAlertTypes(res.locals)

      const prisonersActiveAlertCodes = alerts
        .filter(alert => !alert.expired)
        .map(alert => alert.alertCode)
        .join(',')

      const offenderDetails = {
        bookingId,
        offenderNo,
        profileUrl: getOffenderUrl(offenderNo),
        name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
      }

      if (req.xhr) {
        const { typeCode } = req.query
        const filteredSubTypes = alertTypes.alertSubTypes
          .filter(st => st.parentValue === typeCode)
          .filter(st => st.activeFlag === 'Y')
          .map(st => ({
            value: st.value,
            text: st.description,
          }))
        return res.send(nunjucks.render('alerts/partials/subTypesSelect.njk', { alertCodes: filteredSubTypes }))
      }

      return res.render('alerts/createAlertForm.njk', {
        offenderDetails,
        prisonersActiveAlertCodes,
        offenderNo,
        bookingId,
        formValues: { effectiveDate: moment().format('DD/MM/YYYY'), ...req.body },
        alertTypes: alertTypes.alertTypes
          .filter(type => type.activeFlag === 'Y')
          .map(type => ({ value: type.value, text: type.description })),
        alertCodes: alertTypes.alertSubTypes.filter(type => type.activeFlag === 'Y').map(type => ({
          value: type.value,
          text: type.description,
        })),
        homeUrl: `${getOffenderUrl(offenderNo)}/alerts`,
        alertsRootUrl: `/prisoner/${offenderNo}/create-alert`,
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `${getOffenderUrl(offenderNo)}/alerts` })
    }
  }

  const handleCreateAlertForm = async (req, res) => {
    const { offenderNo } = req.params
    const { bookingId, alertType, alertCode, comments, effectiveDate: alertDate, existingAlerts } = req.body
    const errors = []

    if (!alertType) {
      errors.push({
        text: 'Select the type of alert',
        href: '#alert-type',
      })
    }

    if (!alertCode) {
      errors.push({
        text: 'Select the alert',
        href: '#alert-code',
      })
    }

    if (existingAlerts && existingAlerts.split(',').includes(alertCode)) {
      errors.push({
        text: 'Select an alert that does not already exist for this offender',
        href: '#alert-code',
      })
    }

    if (comments && comments.length > 1000) {
      errors.push({
        text: 'Enter why you are creating this alert using 1,000 characters or less',
        href: '#comments',
      })
    }

    if (!comments) {
      errors.push({
        text: 'Enter why you are creating this alert',
        href: '#comments',
      })
    }

    if (!alertDate) {
      errors.push({
        text: 'Select when you want this alert to start',
        href: '#effective-date',
      })
    }

    if (alertDate && !moment(alertDate, 'DD/MM/YYYY').isValid()) {
      errors.push({
        text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2020',
        href: '#effective-date',
      })
    }

    if (alertDate && moment(alertDate, 'DD/MM/YYYY') > moment()) {
      errors.push({
        text: 'Enter a date which is not in the future in the format DD/MM/YYYY - for example, 27/03/2020',
        href: '#effective-date',
      })
    }

    if (alertDate && moment(alertDate, 'DD/MM/YYYY') < moment().subtract(8, 'days')) {
      errors.push({
        text:
          'Enter a date that is not more than 8 days in the past in the format DD/MM/YYYY - for example, 27/03/2020',
        href: '#effective-date',
      })
    }

    if (errors.length > 0) {
      const { firstName, lastName, alerts } = await elite2Api.getDetails(res.locals, offenderNo, true)

      const prisonersActiveAlertCodes = alerts
        .filter(alert => !alert.expired)
        .map(alert => alert.alertCode)
        .join(',')

      const alertTypes = await referenceCodesService.getAlertTypes(res.locals)
      const alertCodes = alertType
        ? alertTypes.alertSubTypes
            .filter(type => type.parentValue === alertType)
            .filter(type => type.activeFlag === 'Y')
            .map(type => ({
              value: type.value,
              text: type.description,
            }))
        : alertTypes.alertSubTypes.filter(type => type.activeFlag === 'Y').map(type => ({
            value: type.value,
            text: type.description,
          }))

      const offenderDetails = {
        bookingId,
        offenderNo,
        profileUrl: getOffenderUrl(offenderNo),
        name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
      }
      return res.render('alerts/createAlertForm.njk', {
        errors,
        bookingId,
        offenderNo,
        formValues: { ...req.body },
        offenderDetails,
        prisonersActiveAlertCodes,
        alertTypes: alertTypes.alertTypes
          .filter(type => type.activeFlag === 'Y')
          .map(type => ({ value: type.value, text: type.description })),
        alertCodes,
        homeUrl: `${getOffenderUrl(offenderNo)}/alerts`,
        alertsRootUrl: `/prisoner/${offenderNo}/create-alert`,
      })
    }

    try {
      await elite2Api.createAlert(res.locals, bookingId, {
        alertType,
        alertCode,
        comment: comments,
        alertDate: moment(alertDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      })

      raiseAnalyticsEvent(
        'Alert Created',
        `Alert type - ${alertCode}`,
        `Alert created for ${req.session.userDetails.activeCaseLoadId}`
      )
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `${getOffenderUrl(offenderNo)}/create-alert` })
    }

    return res.redirect(`${getOffenderUrl(offenderNo)}/alerts`)
  }

  return { handleCreateAlertForm, displayCreateAlertPage, displayEditAlertPage, handleEditAlertForm }
}

module.exports = { alertFactory }
