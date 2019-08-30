const moment = require('moment')
const { formatTimestampToDate } = require('../utils')
const config = require('../config')

const alertFactory = elite2Api => {
  const displayCloseAlertForm = async (req, res) => {
    const { offenderNo, alertId } = req.query
    const { bookingId } = await elite2Api.getDetails(res.locals, offenderNo)
    const response = await elite2Api.getAlert(res.locals, bookingId, alertId)
    const alert = {
      ...response,
      dateCreated: formatTimestampToDate(response.dateCreated),
    }

    res.render('closeAlertForm.njk', {
      title: 'Close alert',
      alert,
      offenderNo,
      errors: req.flash('errors'),
    })
  }

  const handleCloseAlertForm = async (req, res) => {
    const { offenderNo, alertId } = req.params
    const { alertStatus } = req.body
    const errors = []

    if (!alertStatus) {
      errors.push({
        text: 'Select yes if you want to close this alert',
        href: '#alertStatus',
      })
    }

    if (errors.length > 0) {
      req.flash('errors', errors)
      return res.redirect('back')
    }

    if (alertStatus === 'yes') {
      const { bookingId } = await elite2Api.getDetails(res.locals, offenderNo)

      await elite2Api.updateAlert(res.locals, bookingId, alertId, {
        alertStatus: 'INACTIVE',
        expiryDate: moment().format('YYYY-MM-DD'),
      })
    }

    return res.redirect(`${config.app.notmEndpointUrl}offenders/${offenderNo}/alerts`)
  }

  return { displayCloseAlertForm, handleCloseAlertForm }
}

module.exports = { alertFactory }
