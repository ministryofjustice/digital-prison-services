const moment = require('moment')
const { formatTimestampToDate, properCaseName, formatName } = require('../utils')
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

const alertFactory = (oauthApi, elite2Api) => {
  const renderTemplate = (req, res, pageData) => {
    const { alert, pageErrors, offenderDetails, ...rest } = pageData
    const formAction = offenderDetails && alert && `/api/edit-alert/${offenderDetails.bookingId}/${alert.alertId}`

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

    res.render('editAlertForm.njk', {
      title: 'Edit / close alert - Digital Prison Services',
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

  const displayEditAlertPage = async (req, res) => {
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
      renderTemplate(req, res, { pageErrors })
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

  return { displayEditAlertPage, handleEditAlertForm }
}

module.exports = { alertFactory }
