const bulkAppointmentsAddedFactory = () => {
  const index = async (req, res) => {
    const prisonersRemoved = req.flash('prisonersRemoved')
    res.render('bulkAppointmentsAdded.njk', { prisonersRemoved })
  }
  return { index }
}

module.exports = {
  bulkAppointmentsAddedFactory,
}
