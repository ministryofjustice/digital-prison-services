const viewAppointmentsFactory = (elite2Api, whereaboutsApi, logError) => {
  const index = async (req, res) => {
    return res.render('viewAppointments.njk', {})
  }

  const post = async (req, res) => {}
  return { index, post }
}

module.exports = viewAppointmentsFactory
