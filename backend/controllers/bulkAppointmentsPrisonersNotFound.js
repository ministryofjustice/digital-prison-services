const bulkAppointmentsPrisonersNotFoundFactory = () => {
  const index = async (req, res) => {
    const { prisonersNotFound } = req.session.data

    res.render('prisonersNotFound.njk', { prisonersNotFound })
  }
  return { index }
}

module.exports = {
  bulkAppointmentsPrisonersNotFoundFactory,
}
