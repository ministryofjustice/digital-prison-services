const moment = require('moment')
const { formatTimestampToDate, properCaseName } = require('../utils')
const config = require('../config')
const { logError } = require('../logError')

// Temporary until we sort out a more permanent solution
let userRoles
let displayName
let activeCaseLoad

const serviceUnavailableMessage = 'Sorry, the service is unavailable'
const getOffenderUrl = offenderNo => `${config.app.notmEndpointUrl}offenders/${offenderNo}`

const alertFactory = (oauthApi, elite2Api) => {
  const displayCloseAlertForm = async (req, res) => {
    let alert
    const { offenderNo, alertId } = req.query
    const offenderDetails = { offenderNo, profileUrl: getOffenderUrl(offenderNo) }
    const errors = []

    try {
      const { bookingId, firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)

      const [alertResponse, user, caseLoads, roles] = await Promise.all([
        elite2Api.getAlert(res.locals, bookingId, alertId),

        // Temporary until we sort out a more permanent solution
        oauthApi.currentUser(res.locals),
        elite2Api.userCaseLoads(res.locals),
        oauthApi.userRoles(res.locals),
      ])

      alert = alertResponse

      // Temporary until we sort out a more permanent solution
      activeCaseLoad = caseLoads.find(cl => cl.currentlyActive)
      userRoles = roles
      displayName = user.name

      offenderDetails.bookingId = bookingId
      offenderDetails.name = `${properCaseName(lastName)}, ${properCaseName(firstName)}`
    } catch (error) {
      logError(req.originalUrl, error)
      errors.push({ text: serviceUnavailableMessage })
    }

    if (alert && alert.expired) errors.push({ text: 'This alert has already expired' })

    if (errors.length > 0) req.flash('errors', errors)

    res.render('closeAlertForm.njk', {
      title: 'Close alert - Digital Prison Services',
      alert: {
        ...alert,
        dateCreated: alert && formatTimestampToDate(alert.dateCreated),
      },
      offenderDetails,
      errors: req.flash('errors'),
      formAction: `/api/close-alert/${offenderDetails.bookingId}/${alertId}`,

      // Temporary until we sort out a more permanent solution
      user: {
        displayName,
        activeCaseLoad: {
          description: activeCaseLoad && activeCaseLoad.description,
        },
      },
      caseLoadId: activeCaseLoad && activeCaseLoad.caseLoadId,
      userRoles,
    })
  }

  const handleCloseAlertForm = async (req, res) => {
    const { bookingId, alertId } = req.params
    const { alertStatus, offenderNo } = req.body
    const closeAlert = alertStatus === 'yes'
    const errors = []

    if (!alertStatus) {
      errors.push({
        text: 'Select yes if you want to close this alert',
        href: '#alertStatus',
      })
    }

    if (closeAlert) {
      try {
        await elite2Api.updateAlert(res.locals, bookingId, alertId, {
          alertStatus: 'INACTIVE',
          expiryDate: moment().format('YYYY-MM-DD'),
        })
      } catch (error) {
        logError(req.originalUrl, error)
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

  return { displayCloseAlertForm, handleCloseAlertForm }
}

module.exports = { alertFactory }
