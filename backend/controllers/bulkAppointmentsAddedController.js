const config = require('../config')

module.exports = (req, res) => {
  const { data } = req.session

  if (!data) {
    return res.render('error.njk', {
      url: '/bulk-appointments/need-to-upload-file',
    })
  }

  const { prisonersNotFound } = data

  return res.render('appointmentsAdded.njk', { prisonersNotFound, dpsUrl: config.app.notmEndpointUrl })
}
