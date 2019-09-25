const bulkAppointmentsCreatedFactory = () => {
  const index = async (req, res) => {
    const { data } = req.session

    if (!data) {
      return res.render('error.njk', {
        url: '/bulk-appointments/need-to-upload-file',
      })
    }

    const { prisonersNotFound } = data

    return res.render('appointmentsCreated.njk', { prisonersNotFound })
  }

  return { index }
}

module.exports = {
  bulkAppointmentsCreatedFactory,
}
