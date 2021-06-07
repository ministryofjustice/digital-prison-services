const { formatName } = require('../utils')

module.exports = ({ prisonApi, whereaboutsApi, appointmentDetailsService }) => async (req, res) => {
  const { id } = req.params
  const { activeCaseLoadId } = req.session.userDetails

  const appointmentDetails = await whereaboutsApi.getAppointment(res.locals, id)

  const [prisonerDetails, appointmentViewModel] = await Promise.all([
    prisonApi.getDetails(res.locals, appointmentDetails.appointment.offenderNo),
    appointmentDetailsService.getAppointmentViewModel(res, appointmentDetails, activeCaseLoadId),
  ])

  const { additionalDetails, basicDetails, prepostData, recurringDetails, timeDetails } = appointmentViewModel

  return res.render('appointmentDetails', {
    additionalDetails,
    basicDetails,
    prepostData,
    prisoner: {
      name: prisonerDetails && formatName(prisonerDetails.firstName, prisonerDetails.lastName),
      number: prisonerDetails?.offenderNo,
    },
    recurringDetails,
    timeDetails,
  })
}
