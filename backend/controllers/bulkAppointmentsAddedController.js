const config = require('../config')

module.exports = (req, res) => {
  const { data } = req.session

  if (!data) {
    return res.render('error.njk', {
      url: '/bulk-appointments/need-to-upload-file',
    })
  }

  const { prisonersRemoved } = data

  return res.render('appointmentsAdded.njk', { prisonersRemoved, dpsUrl: config.app.notmEndpointUrl })
}
