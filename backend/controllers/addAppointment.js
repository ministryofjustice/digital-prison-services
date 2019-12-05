const {
  app: { notmEndpointUrl },
} = require('../config')
const { properCaseName } = require('../utils')

// Put somewhere and share with bulk appointment bulkAppointmentsAddDetails
const repeatTypes = [
  { value: 'WEEKLY', text: 'Weekly' },
  { value: 'DAILY', text: 'Daily' },
  { value: 'WEEKDAYS', text: 'Weekday (Monday to Friday)' },
  { value: 'MONTHLY', text: 'Monthly' },
  { value: 'FORTNIGHTLY', text: 'Fortnightly' },
]

// Put somewhere and share with bulk appointment bulkAppointmentsAddDetails
const toSelectValue = data => ({
  value: data.id,
  text: data.description,
})

const addAppointmentFactory = (appointmentsService, elite2Api, logError) => {
  const getAppointmentTypesAndLocations = async (locals, activeCaseLoadId) => {
    const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
      locals,
      activeCaseLoadId
    )

    return {
      appointmentTypes: appointmentTypes.map(toSelectValue),
      appointmentLocations: locationTypes.map(toSelectValue),
    }
  }

  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, 'Sorry, the service is unavailable')

    return res.render('error.njk', { url: '/' })
  }

  const renderTemplate = (req, res, pageData) => {
    res.render('addAppointment.njk', pageData)
  }

  const index = async (req, res) => {
    const { offenderNo } = req.params

    if (!offenderNo) {
      return res.redirect('/')
    }

    try {
      const { activeCaseLoadId } = req.session.userDetails
      const { firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)
      const offenderName = `${properCaseName(lastName)}, ${properCaseName(firstName)}`

      const { appointmentTypes, appointmentLocations } = await getAppointmentTypesAndLocations(
        res.locals,
        activeCaseLoadId
      )

      return renderTemplate(req, res, {
        offenderNo,
        offenderName,
        notmEndpointUrl,
        appointmentTypes,
        appointmentLocations,
        repeatTypes,
      })
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const post = async (req, res) => {
    // To do
  }

  return { index, post }
}

module.exports = {
  addAppointmentFactory,
}
