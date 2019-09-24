const bulkAppointmentsFactory = logError => {
  const index = async (req, res) => {
    const { type, location, startDate, startTime, endTime, occurences, frequency } = req.query || {}

    const appointmentDetails = {
      type,
      location,
      startDate,
      startTime,
      endTime,
      occurences,
      frequency,
    }

    try {
      if (!startDate || !location || !type) {
        res.render('error.njk', {
          title: 'Upload a CSV File',
        })
        return
      }

      res.render('bulkUploadFile.njk', {
        title: 'Upload a CSV File',
        errors: req.flash('errors'),
        appointmentDetails,
      })
    } catch (error) {
      logError(req.originalUrl, error, 'Sorry, the service is unavailable')
      res.render('error.njk', {
        title: 'Upload a CSV File',
      })
    }
  }

  return {
    index,
  }
}

module.exports = { bulkAppointmentsFactory }
