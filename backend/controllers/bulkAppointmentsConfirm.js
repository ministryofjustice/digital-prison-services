const { logError } = require('../logError')

const bulkAppointmentsConfirmFactory = elite2Api => {
  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, 'Sorry, the service is unavailable')

    return res.render('error.njk', { url: '/need-to-upload-file' })
  }

  const view = async (req, res) => {
    const { data } = req.session

    if (!data) return renderError(req, res)

    return res.render('confirmAppointments.njk', { appointmentDetails: data })
  }

  const submit = async (req, res) => {
    const {
      data: { appointmentType, location, startTime, endTime, prisonersListed, comment },
    } = req.session

    const appointments = {
      appointmentDefaults: {
        comment,
        locationId: Number(location),
        appointmentType,
        startTime,
        endTime,
      },
      appointments: prisonersListed.map(prisoner => ({
        bookingId: prisoner.bookingId,
      })),
    }

    try {
      await elite2Api.addBulkAppointments(res.locals, appointments)
    } catch (error) {
      return renderError(req, res, error)
    }

    return res.redirect('/bulk-appointments/success')
  }

  return { view, submit }
}

module.exports = {
  bulkAppointmentsConfirmFactory,
}
