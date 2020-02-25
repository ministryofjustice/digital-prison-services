const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')

const viewAppointmentsFactory = (elite2Api, whereaboutsApi, logError) => {
  const index = async (req, res) => {
    const { date = moment().format('DD/MM/YYYY'), period, type, location } = req.query

    try {
      const [appointmentTypes, appointmentLocations] = await Promise.all([
        elite2Api.getAppointmentTypes(res.locals),
        elite2Api.getLocationsForAppointments(res.locals, req.session.userDetails.activeCaseLoadId),
      ])

      const types = appointmentTypes.map(appointmentType => ({
        text: appointmentType.description,
        value: appointmentType.code,
      }))

      const locations = appointmentLocations.map(appointmentLocation => ({
        text: appointmentLocation.userDescription,
        value: appointmentLocation.locationId,
      }))

      return res.render('viewAppointments.njk', {
        types,
        locations,
        date: moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY'),
        formattedDate: moment(date, 'DD/MM/YYYY').format('D MMMM YYYY'),
        period: period || 'am',
        type: type || 'all',
        location: location || 'all',
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk')
    }
  }

  return { index }
}

module.exports = viewAppointmentsFactory
