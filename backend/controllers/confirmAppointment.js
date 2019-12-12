const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')

const { properCaseName } = require('../utils')

const confirmAppointmentFactory = logError => {
  const index = async (req, res) => {
    const {
      offenderNo,
      firstName,
      lastName,
      appointmentType,
      location,
      date,
      startTime,
      duration,
      recurring,
      comments,
    } = req.flash('appointmentDetails')

    res.render('confirmAppointments.njk', {
      offenderProfileLink: `${dpsUrl}offenders/${offenderNo}?appointmentAdded=true`,
      prisonerName: `${properCaseName(firstName)} ${properCaseName(lastName)} (${offenderNo})`,
      appointmentType,
      location,
      date,
      startTime,
      duration,
      recurring,
      comments,
    })
  }
  return { index }
}

module.exports = {
  confirmAppointmentFactory,
}
