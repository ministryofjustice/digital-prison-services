const bulkAppointmentsClashesFactory = (elite2Api, logError) => {
  const renderTemplate = (req, res, pageData) => {
    const { appointmentDetails, errors } = pageData

    res.render('appointmentsClashes.njk', {
      appointmentDetails,
      errors,
    })
  }

  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, 'Sorry, the service is unavailable')

    return res.render('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
  }

  const index = async (req, res) => {
    // const { data } = req.session
    const data = { test: 'delete me' }

    if (!data) return renderError(req, res)

    return renderTemplate(req, res, { appointmentDetails: data })
  }

  return { index }
}

module.exports = {
  bulkAppointmentsClashesFactory,
}
