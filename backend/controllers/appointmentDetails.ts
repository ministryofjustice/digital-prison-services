import { formatName } from '../utils'

export default ({ oauthApi, prisonApi, whereaboutsApi, appointmentDetailsService }) =>
  async (req, res) => {
    const { id } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    const appointmentDetails = await whereaboutsApi.getAppointment(res.locals, id)

    const [prisonerDetails, appointmentViewModel] = await Promise.all([
      prisonApi.getDetails(res.locals, appointmentDetails.appointment.offenderNo),
      appointmentDetailsService.getAppointmentViewModel(res, appointmentDetails, activeCaseLoadId),
    ])

    const { additionalDetails, basicDetails, prepostData, recurringDetails, timeDetails } = appointmentViewModel

    const userRoles = oauthApi.userRoles(res.locals)

    const canDeleteAppointment =
      userRoles &&
      userRoles.some((role) => role.roleCode === 'ACTIVITY_HUB' || role.roleCode === 'DELETE_A_PRISONERS_APPOINTMENT')

    return res.render('appointmentDetails', {
      appointmentConfirmDeletionLink: canDeleteAppointment && `/appointment-details/${id}/confirm-deletion`,
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
