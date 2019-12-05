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

const addAppointmentFactory = elite2Api => {
  const renderTemplate = (req, res, pageData) => {
    res.render('addAppointment.njk', pageData)
  }

  const index = async (req, res) => {
    const { offenderNo } = req.params

    if (!offenderNo) {
      return res.redirect('/')
    }

    try {
      const { firstName, lastName, agencyId } = await elite2Api.getDetails(res.locals, offenderNo)
      const offenderName = `${properCaseName(lastName)}, ${properCaseName(firstName)}`
      const [appointmentTypes, appointmentLocations] = await Promise.all([
        elite2Api.getAppointmentTypes(res.locals),
        elite2Api.getLocationsForAppointments(res.locals, agencyId),
      ])

      return renderTemplate(req, res, {
        offenderNo,
        offenderName,
        notmEndpointUrl,
        appointmentTypes,
        appointmentLocations,
        repeatTypes,
      })
    } catch (error) {
      return console.log(error)
    }
  }

  const post = async (req, res) => {
    // const payload = {
    //   offenderNo: props.match.params.offenderNo,
    //   detail: {
    //     appointmentDefaults: {
    //       appointmentType,
    //       locationId: location,
    //       startTime,
    //       endTime,
    //       comment,
    //     },
    //   },
    // }
    // if (recurringAppointment) {
    //   payload.detail.repeat = {
    //     repeatPeriod,
    //     count: repeatCount,
    //   }
    // }
  }

  return { index, post }
}

module.exports = {
  addAppointmentFactory,
}

// Back from getDetails
// { bookingId: 1065240,
//   bookingNo: 'V74111',
//   offenderNo: 'G9542VP',
//   firstName: 'BERTRAND',
//   middleName: 'CONREEM',
//   lastName: 'AADLAND',
//   agencyId: 'MDI',
//   assignedLivingUnitId: 25750,
//   activeFlag: true,
//   dateOfBirth: '1979-03-22' }
