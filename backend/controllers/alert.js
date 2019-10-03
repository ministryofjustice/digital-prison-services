const moment = require('moment')
const { formatTimestampToDate, properCaseName, formatName } = require('../utils')
const config = require('../config')
const { logError } = require('../logError')
const { raiseAnalyticsEvent } = require('../raiseAnalyticsEvent')
const { serviceUnavailableMessage } = require('../common-messages')

const getOffenderUrl = offenderNo => `${config.app.notmEndpointUrl}offenders/${offenderNo}`

const alertFactory = (oauthApi, elite2Api) => {
  const renderTemplate = (req, res, pageData) => {
    const { alert, pageErrors, offenderDetails, ...rest } = pageData
    const formAction = offenderDetails && alert && `/api/close-alert/${offenderDetails.bookingId}/${alert.alertId}`

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

    res.render('closeAlertForm.njk', {
      title: 'Close alert - Digital Prison Services',
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
        dateCreated: formatTimestampToDate(dateCreated),
        createdBy: formatName(addedByFirstName, addedByLastName),
      },
      ...rest,
    })
  }

  const displayCloseAlertPage = async (req, res) => {
    const pageErrors = []

    try {
      const { offenderNo, alertId } = req.query
      const { bookingId, firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)

      const [alert, user, caseLoads, userRoles] = await Promise.all([
        elite2Api.getAlert(res.locals, bookingId, alertId),
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
      ])

      const offenderDetails = {
        bookingId,
        offenderNo,
        profileUrl: getOffenderUrl(offenderNo),
        name: `${properCaseName(lastName)}, ${properCaseName(firstName)}`,
      }
      const activeCaseLoad = caseLoads.find(cl => cl.currentlyActive)

      if (alert && alert.expired) pageErrors.push({ text: 'This alert has already expired' })

      renderTemplate(req, res, {
        alert,
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
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      pageErrors.push({ text: serviceUnavailableMessage })
      renderTemplate(req, res, { pageErrors })
    }
  }

  const handleCloseAlertForm = async (req, res) => {
    const { bookingId, alertId } = req.params
    const { alertStatus, offenderNo } = req.body
    const closeAlert = alertStatus === 'yes'
    const errors = []

    const [alert, caseLoads] = await Promise.all([
      elite2Api.getAlert(res.locals, bookingId, alertId),
      elite2Api.userCaseLoads(res.locals),
    ])

    const activeCaseLoad = caseLoads.find(cl => cl.currentlyActive)

    if (!alertStatus) {
      errors.push({
        text: 'Select yes if you want to close this alert',
        href: '#alertStatus',
      })
    }

    if (closeAlert) {
      try {
        await elite2Api.updateAlert(res.locals, bookingId, alertId, {
          expiryDate: moment().format('YYYY-MM-DD'),
        })

        raiseAnalyticsEvent(
          'Alert Closed',
          `Alert closed for ${activeCaseLoad.caseLoadId}`,
          `Alert type - ${alert.alertCode}`
        )
      } catch (error) {
        logError(req.originalUrl, error, serviceUnavailableMessage)
        errors.push({
          text: serviceUnavailableMessage,
        })
      }
    }

    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('back')
    }

    return res.redirect(`${getOffenderUrl(offenderNo)}/alerts?alertStatus=${closeAlert ? 'closed' : 'open'}`)
  }

  return { displayCloseAlertPage, handleCloseAlertForm }
}

module.exports = { alertFactory }
