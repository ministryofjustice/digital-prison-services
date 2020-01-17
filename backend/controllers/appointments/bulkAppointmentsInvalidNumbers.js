const bulkAppointmentsInvalidNumbersFactory = () => {
  const index = async (req, res) => {
    const { prisonersNotFound, prisonersDuplicated } = req.session.data

    res.render('bulkAppointmentsInvalidNumbers.njk', { prisonersNotFound, prisonersDuplicated })
  }
  return { index }
}

module.exports = {
  bulkAppointmentsInvalidNumbersFactory,
}
