const config = require('../../config')

const bulkAppointmentsAddedFactory = () => {
  const index = async (req, res) => {
    const prisonersRemoved = req.flash('prisonersRemoved')
    res.render('bulkAppointmentsAdded.njk', { prisonersRemoved, dpsUrl: config.app.notmEndpointUrl })
  }
  return { index }
}

module.exports = {
  bulkAppointmentsAddedFactory,
}
